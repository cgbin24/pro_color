import React, { useState, useEffect } from 'react';
import { FiTrash2, FiDownload, FiUpload, FiRefreshCw } from 'react-icons/fi';
import {
  ThemeConfig,
  ThemeName,
  DEFAULT_THEMES
} from '../../types';
import {
  getConfig,
  saveConfig,
  exportConfig,
  importConfig,
  resetConfig
} from '../../utils/storage';
import './Options.css';

const Options: React.FC = () => {
  const [config, setConfig] = useState<ThemeConfig | null>(null);
  const [sitesList, setSitesList] = useState<{ hostname: string; theme: ThemeName }[]>([]);
  const [newHostname, setNewHostname] = useState<string>('');
  const [newTheme, setNewTheme] = useState<ThemeName>('theme-white');
  const [importError, setImportError] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [exportText, setExportText] = useState<string>('');
  
  // 加载配置
  useEffect(() => {
    const loadConfig = async () => {
      const config = await getConfig();
      setConfig(config);
      
      // 转换主题映射为数组形式
      const sites = Object.entries(config.themes).map(([hostname, theme]) => ({
        hostname,
        theme: theme as ThemeName
      }));
      
      setSitesList(sites);
    };
    
    loadConfig();
  }, []);
  
  // 添加新站点
  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newHostname || !newTheme) return;
    
    // 检查是否已存在
    const existingSite = sitesList.find(site => site.hostname === newHostname);
    
    if (existingSite) {
      // 更新已存在的站点
      const updatedSites = sitesList.map(site => 
        site.hostname === newHostname 
          ? { ...site, theme: newTheme } 
          : site
      );
      setSitesList(updatedSites);
    } else {
      // 添加新站点
      setSitesList([...sitesList, { hostname: newHostname, theme: newTheme }]);
    }
    
    // 更新配置
    if (config) {
      const updatedConfig = { 
        ...config, 
        themes: { 
          ...config.themes, 
          [newHostname]: newTheme 
        } 
      };
      
      await saveConfig(updatedConfig);
      setConfig(updatedConfig);
    }
    
    // 清空输入
    setNewHostname('');
  };
  
  // 删除站点
  const handleDeleteSite = async (hostname: string) => {
    // 更新列表
    const updatedSites = sitesList.filter(site => site.hostname !== hostname);
    setSitesList(updatedSites);
    
    // 更新配置
    if (config) {
      const updatedThemes = { ...config.themes };
      delete updatedThemes[hostname];
      
      const updatedConfig = {
        ...config,
        themes: updatedThemes
      };
      
      await saveConfig(updatedConfig);
      setConfig(updatedConfig);
    }
  };
  
  // 处理导出
  const handleExport = async () => {
    const configJson = await exportConfig();
    setExportText(configJson);
  };
  
  // 处理导入
  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    setImportSuccess(false);
    
    try {
      const success = await importConfig(exportText);
      
      if (success) {
        // 重新加载配置
        const newConfig = await getConfig();
        setConfig(newConfig);
        
        const sites = Object.entries(newConfig.themes).map(([hostname, theme]) => ({
          hostname,
          theme: theme as ThemeName
        }));
        
        setSitesList(sites);
        setImportSuccess(true);
        setExportText('');
      } else {
        setImportError('导入失败，配置格式不正确');
      }
    } catch (error) {
      setImportError('导入出错: ' + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  // 重置配置
  const handleReset = async () => {
    if (window.confirm('确定要恢复默认设置吗？所有自定义设置将被删除。')) {
      await resetConfig();
      
      // 重新加载配置
      const newConfig = await getConfig();
      setConfig(newConfig);
      setSitesList([]);
      setImportSuccess(false);
      setExportText('');
    }
  };
  
  // 渲染主题选择器
  const renderThemeSelector = (
    value: ThemeName,
    onChange: (theme: ThemeName) => void
  ) => (
    <select
      className="theme-select"
      value={value}
      onChange={(e) => onChange(e.target.value as ThemeName)}
    >
      {DEFAULT_THEMES.map(theme => (
        <option key={theme.id} value={theme.id}>
          {theme.name}
        </option>
      ))}
    </select>
  );
  
  if (!config) {
    return <div className="loading">加载中...</div>;
  }
  
  return (
    <div className="options-container">
      <header className="options-header">
        <h1>Pro Color 设置</h1>
        <p>版本 {config.version}</p>
      </header>
      
      <section className="section">
        <h2>网站主题设置</h2>
        
        <div className="sites-table-container">
          {sitesList.length > 0 ? (
            <table className="sites-table">
              <thead>
                <tr>
                  <th>网站域名</th>
                  <th>主题</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {sitesList.map(site => (
                  <tr key={site.hostname}>
                    <td>{site.hostname}</td>
                    <td>
                      {DEFAULT_THEMES.find(theme => theme.id === site.theme)?.name || site.theme}
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteSite(site.hostname)}
                        title="删除"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>还没有设置任何网站的主题。</p>
            </div>
          )}
        </div>
        
        <form className="add-site-form" onSubmit={handleAddSite}>
          <input
            type="text"
            placeholder="输入网站域名 (例如: example.com)"
            value={newHostname}
            onChange={(e) => setNewHostname(e.target.value)}
            required
          />
          {renderThemeSelector(newTheme, setNewTheme)}
          <button type="submit">添加</button>
        </form>
      </section>
      
      <section className="section">
        <h2>导入/导出设置</h2>
        
        <div className="import-export">
          <div className="import-section">
            <button className="action-btn" onClick={handleExport}>
              <FiDownload /> 导出配置
            </button>
            
            {exportText && (
              <div className="export-result">
                <textarea
                  value={exportText}
                  readOnly
                  rows={5}
                  onClick={(e) => {
                    (e.target as HTMLTextAreaElement).select();
                    document.execCommand('copy');
                  }}
                />
                <small>点击文本框自动复制</small>
              </div>
            )}
          </div>
          
          <div className="import-section">
            <form onSubmit={handleImport}>
              <textarea
                placeholder="粘贴配置数据..."
                value={exportText}
                onChange={(e) => setExportText(e.target.value)}
                rows={5}
                required
              />
              <button type="submit" className="action-btn">
                <FiUpload /> 导入配置
              </button>
            </form>
            
            {importError && <div className="error-message">{importError}</div>}
            {importSuccess && <div className="success-message">导入成功！</div>}
          </div>
        </div>
      </section>
      
      <section className="section">
        <div className="reset-section">
          <h2>重置设置</h2>
          <p>将所有设置恢复为默认状态。此操作不可撤销。</p>
          <button className="reset-btn" onClick={handleReset}>
            <FiRefreshCw /> 恢复默认设置
          </button>
        </div>
      </section>
    </div>
  );
};

export default Options; 