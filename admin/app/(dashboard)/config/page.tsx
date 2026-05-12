'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Smartphone, Shield, Zap, Globe, Save, RefreshCw } from 'lucide-react';
import styles from './page.module.css';

export default function ConfigPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    maintenanceMode: false,
    minVersion: '1.0.4',
    enableSubscriptions: true,
    enableChat: true,
    maxMatchesPerUser: 5,
    supportEmail: 'support@unionsahelienne.com',
  });

  const handleToggle = (key: keyof typeof config) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setConfig(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? parseInt(value) : value 
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Configuration saved successfully!');
    }, 1000);
  };

  return (
    <div className="animate-fade-in-up">
      <header className={styles.header}>
        <div>
          <h1>Mobile App Config</h1>
          <p>Global settings and feature toggles for the mobile application</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            <RefreshCw size={18} style={{ marginRight: '8px' }} />
            Reload
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            <Save size={18} style={{ marginRight: '8px' }} />
            Save Changes
          </Button>
        </div>
      </header>

      <div className={styles.configGrid}>
        {/* System Status Section */}
        <section className={styles.configSection}>
          <div className={styles.sectionHeader}>
            <Shield size={20} className={styles.sectionIcon} />
            <div>
              <h2 className={styles.sectionTitle}>System & Security</h2>
              <p className={styles.sectionDesc}>Critical app behavior and access control</p>
            </div>
          </div>
          
          <div className={styles.configCard}>
            <div className={styles.settingRow}>
              <div>
                <div className={styles.settingLabel}>Maintenance Mode</div>
                <div className={styles.settingHint}>Disable all user access to the mobile app for updates</div>
              </div>
              <Button 
                variant={config.maintenanceMode ? 'danger' : 'outline'}
                onClick={() => handleToggle('maintenanceMode')}
              >
                {config.maintenanceMode ? 'Active' : 'Inactive'}
              </Button>
            </div>

            <div className={styles.settingRow}>
              <div className={styles.inputWrapper}>
                <Input 
                  label="Minimum Required Version"
                  name="minVersion"
                  value={config.minVersion}
                  onChange={handleChange}
                  placeholder="e.g. 1.0.4"
                />
              </div>
              <Badge variant="info">Current: 1.0.5</Badge>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.configSection}>
          <div className={styles.sectionHeader}>
            <Zap size={20} className={styles.sectionIcon} />
            <div>
              <h2 className={styles.sectionTitle}>Feature Management</h2>
              <p className={styles.sectionDesc}>Enable or disable core app functionalities</p>
            </div>
          </div>
          
          <div className={styles.configCard}>
            <div className={styles.settingRow}>
              <div>
                <div className={styles.settingLabel}>Subscription System</div>
                <div className={styles.settingHint}>Enable premium membership and payment processing</div>
              </div>
              <Button 
                variant={config.enableSubscriptions ? 'primary' : 'secondary'}
                onClick={() => handleToggle('enableSubscriptions')}
              >
                {config.enableSubscriptions ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className={styles.settingRow}>
              <div>
                <div className={styles.settingLabel}>In-App Chat</div>
                <div className={styles.settingHint}>Allow matched users to communicate in real-time</div>
              </div>
              <Button 
                variant={config.enableChat ? 'primary' : 'secondary'}
                onClick={() => handleToggle('enableChat')}
              >
                {config.enableChat ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className={styles.settingRow}>
              <div className={styles.inputWrapper}>
                <Input 
                  label="Max Active Matches"
                  name="maxMatchesPerUser"
                  type="number"
                  value={config.maxMatchesPerUser}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Global Branding Section */}
        <section className={styles.configSection}>
          <div className={styles.sectionHeader}>
            <Globe size={20} className={styles.sectionIcon} />
            <div>
              <h2 className={styles.sectionTitle}>Support & Meta</h2>
              <p className={styles.sectionDesc}>Contact info and legal endpoints</p>
            </div>
          </div>
          
          <div className={styles.configCard}>
            <Input 
              label="Support Contact Email"
              name="supportEmail"
              value={config.supportEmail}
              onChange={handleChange}
            />
            
            <div className={styles.infoBox} style={{ marginTop: '16px' }}>
              Changes to these settings take effect immediately on next app launch.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
