import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  Settings,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  Users,
  FileText
} from 'lucide-react';
import '../../styles/payment-config.css';

interface PaymentGatewayConfigFormProps {
  isSuperAdmin?: boolean;
  onAddSystemLog?: (log: any) => void;
}

export const PaymentGatewayConfigForm: React.FC<PaymentGatewayConfigFormProps> = ({
  isSuperAdmin = false,
  onAddSystemLog
}) => {
  const {
    agentPaymentConfig,
    updateAgentPaymentConfig,
    platformPaymentConfig,
    updatePlatformPaymentConfig
  } = useSusu();

  // Pick initial config based on role
  const sourceConfig = isSuperAdmin ? platformPaymentConfig : agentPaymentConfig;

  const [provider, setProvider] = useState<'paystack' | 'mooire' | 'hubtel' | 'flutterwave'>(
    (sourceConfig as any).provider || 'paystack'
  );
  const [paymentMode, setPaymentMode] = useState<'test' | 'live'>(
    (sourceConfig as any).paymentMode || (isSuperAdmin ? platformPaymentConfig.environment : 'test')
  );
  const [gatewayStatus, setGatewayStatus] = useState<'active' | 'inactive'>(
    (sourceConfig as any).gatewayStatus || 'active'
  );
  const [storeCheckoutType, setStoreCheckoutType] = useState(
    (sourceConfig as any).storeCheckoutType || 'Direct online payments'
  );
  const [publicKey, setPublicKey] = useState(
    (sourceConfig as any).publicKey ||
      (isSuperAdmin ? platformPaymentConfig.masterPublicKey : agentPaymentConfig.publicKey) ||
      import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
      ''
  );
  const [secretKey, setSecretKey] = useState(
    (sourceConfig as any).secretKey ||
      (isSuperAdmin ? platformPaymentConfig.masterSecretKey : agentPaymentConfig.secretKey) ||
      import.meta.env.VITE_PAYSTACK_SECRET_KEY ||
      ''
  );
  const [webhookSecret, setWebhookSecret] = useState(
    (sourceConfig as any).webhookSecret || ''
  );
  const [enableDirectStoreProcessing, setEnableDirectStoreProcessing] = useState<boolean>(
    (sourceConfig as any).enableDirectStoreProcessing ?? true
  );
  const [minResellerTopUp, setMinResellerTopUp] = useState<string>(
    ((sourceConfig as any).minResellerTopUp ?? 10).toFixed(2)
  );
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    const src = isSuperAdmin ? platformPaymentConfig : agentPaymentConfig;
    setProvider((src as any).provider || 'paystack');
    setPaymentMode((src as any).paymentMode || (isSuperAdmin ? platformPaymentConfig.environment : 'test'));
    setGatewayStatus((src as any).gatewayStatus || 'active');
    setStoreCheckoutType((src as any).storeCheckoutType || 'Direct online payments');
    setPublicKey((src as any).publicKey || (isSuperAdmin ? platformPaymentConfig.masterPublicKey : agentPaymentConfig.publicKey) || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '');
    setSecretKey((src as any).secretKey || (isSuperAdmin ? platformPaymentConfig.masterSecretKey : agentPaymentConfig.secretKey) || import.meta.env.VITE_PAYSTACK_SECRET_KEY || '');
    setWebhookSecret((src as any).webhookSecret || '');
    setEnableDirectStoreProcessing((src as any).enableDirectStoreProcessing ?? true);
    setMinResellerTopUp(((src as any).minResellerTopUp ?? 10).toFixed(2));
  }, [isSuperAdmin, platformPaymentConfig, agentPaymentConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      provider,
      paymentMode,
      gatewayStatus,
      storeCheckoutType,
      publicKey,
      secretKey,
      webhookSecret,
      enableDirectStoreProcessing,
      minResellerTopUp: parseFloat(minResellerTopUp) || 10.0
    };

    if (isSuperAdmin) {
      updatePlatformPaymentConfig({
        ...payload,
        activeGateway: provider as any,
        environment: paymentMode,
        masterPublicKey: publicKey,
        masterSecretKey: secretKey,
        webhookSecret
      });
      if (onAddSystemLog) {
        onAddSystemLog({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: 'security',
          message: `SUPER ADMIN UPDATED MASTER GATEWAY: Provider=${provider.toUpperCase()}, Mode=${paymentMode.toUpperCase()}, DirectStoreProcessing=${enableDirectStoreProcessing}`,
          source: 'super-admin-payment-config'
        });
      }
    } else {
      updateAgentPaymentConfig(payload);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <div>
      {/* Success Notification */}
      {saved && (
        <div
          style={{
            background: '#064e3b',
            color: '#a7f3d0',
            border: '1px solid #059669',
            padding: '0.95rem 1.25rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 4px 12px rgba(6, 78, 59, 0.4)'
          }}
        >
          <CheckCircle2 size={20} color="#34d399" />
          {isSuperAdmin
            ? 'Super Admin Master Gateway Configuration saved and active across the platform!'
            : 'Payment provider configuration saved and active for direct online checkouts!'}
        </div>
      )}

      {/* Card 1: Current Status */}
      <div className="payment-card-dark">
        <h2 className="payment-card-title">Current Status</h2>
        <div className="payment-status-grid">
          <div className="payment-status-item">
            <span className="payment-status-label">Provider</span>
            <span className="payment-status-value">
              {provider === 'paystack'
                ? 'Paystack'
                : provider === 'mooire'
                ? 'Mooire'
                : provider === 'hubtel'
                ? 'Hubtel'
                : 'Flutterwave'}
            </span>
          </div>

          <div className="payment-status-item">
            <span className="payment-status-label">Mode</span>
            <span className="payment-status-value">
              <span className={`status-pill-badge mode-${paymentMode}`}>
                {paymentMode === 'test' ? 'Test' : 'Live'}
              </span>
            </span>
          </div>

          <div className="payment-status-item">
            <span className="payment-status-label">Status</span>
            <span className="payment-status-value">
              <span className={`status-pill-badge status-${gatewayStatus}`}>
                {gatewayStatus === 'active' ? 'Active' : 'Inactive'}
              </span>
            </span>
          </div>

          <div className="payment-status-item">
            <span className="payment-status-label">Store Checkout</span>
            <span className="payment-status-value">{storeCheckoutType}</span>
          </div>
        </div>
      </div>

      {/* Card 2: ⚙️ Provider Settings */}
      <div className="payment-card-dark">
        <h2 className="payment-card-title">
          <Settings size={20} color="#3b82f6" /> Provider Settings
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Payment Provider Dropdown */}
          <div className="payment-form-group">
            <label className="payment-field-label">Payment Provider</label>
            <select
              className="payment-field-input payment-field-select"
              value={provider}
              onChange={(e) => setProvider(e.target.value as any)}
            >
              <option value="paystack">Paystack</option>
              <option value="mooire">Mooire</option>
              <option value="hubtel">Hubtel</option>
              <option value="flutterwave">Flutterwave</option>
            </select>
          </div>

          {/* Informative Blue Callout Box */}
          <div className="payment-info-box">
            {provider === 'paystack'
              ? 'Use your Paystack keys here when you want store buyers to pay through your own Paystack account.'
              : provider === 'mooire'
              ? 'Use your Mooire credentials here when you want store buyers to pay through your own Mooire merchant account.'
              : provider === 'hubtel'
              ? 'Use your Hubtel credentials here when you want store buyers to pay through your own Hubtel merchant account.'
              : 'Use your Flutterwave public and secret keys here for direct payment processing.'}
          </div>

          {/* Public Key */}
          <div className="payment-form-group">
            <label className="payment-field-label">Public Key</label>
            <input
              type="text"
              className="payment-field-input"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              required
            />
            <div className="payment-field-help">
              Used only when {provider.charAt(0).toUpperCase() + provider.slice(1)} is the selected provider.
            </div>
          </div>

          {/* Secret Key with Mask & Toggle */}
          <div className="payment-form-group">
            <label className="payment-field-label">Secret Key</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showSecretKey ? 'text' : 'password'}
                className="payment-field-input"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                style={{ paddingRight: '2.75rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showSecretKey ? 'Hide secret key' : 'Show secret key'}
              >
                {showSecretKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="payment-field-help">
              Keep this secret. It is used only for your store payment verification.
            </div>
          </div>

          {/* Webhook Secret (Optional) */}
          <div className="payment-form-group">
            <label className="payment-field-label">Webhook Secret (Optional)</label>
            <input
              type="text"
              className="payment-field-input"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
            />
          </div>

          {/* Payment Mode (Radio Buttons) */}
          <div className="payment-form-group">
            <label className="payment-field-label">Payment Mode</label>
            <div className="payment-radio-group">
              <label className="payment-radio-label">
                <input
                  type="radio"
                  name={`paymentMode_${isSuperAdmin ? 'admin' : 'agent'}`}
                  value="test"
                  checked={paymentMode === 'test'}
                  onChange={() => setPaymentMode('test')}
                />
                Test Mode
              </label>
              <label className="payment-radio-label">
                <input
                  type="radio"
                  name={`paymentMode_${isSuperAdmin ? 'admin' : 'agent'}`}
                  value="live"
                  checked={paymentMode === 'live'}
                  onChange={() => setPaymentMode('live')}
                />
                Live Mode
              </label>
            </div>
            <div className="payment-field-help">
              Use test mode until you have confirmed the provider credentials work from your store checkout.
            </div>
          </div>

          {/* Direct Store Payment Processing Checkbox */}
          <div className="payment-form-group">
            <label className="payment-checkbox-label">
              <input
                type="checkbox"
                checked={enableDirectStoreProcessing}
                onChange={(e) => setEnableDirectStoreProcessing(e.target.checked)}
              />
              Enable direct store payment processing
            </label>
          </div>

          {/* Reseller Wallet Top-ups (Sub-sellers Only) Highlight Card */}
          <div className="reseller-highlight-card">
            <h4 className="reseller-highlight-title">
              <Users size={18} color="#f59e0b" /> Reseller wallet top-ups (sub-sellers only)
            </h4>
            <p className="reseller-highlight-desc">
              Set the minimum amount your sub-sellers must add when topping up their wallet. This does not
              apply to customers paying on your storefront checkout. Leave empty or enter 0 to use only the
              gateway minimum (GHS 1.00).
            </p>

            <div style={{ maxWidth: '280px' }}>
              <label
                style={{
                  display: 'block',
                  color: '#cbd5e1',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  marginBottom: '0.4rem'
                }}
              >
                Minimum reseller top-up (GHS)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="payment-field-input"
                value={minResellerTopUp}
                onChange={(e) => setMinResellerTopUp(e.target.value)}
              />
            </div>
          </div>

          {/* Save Configuration Button */}
          <button type="submit" className="btn-save-payment-config">
            <Save size={18} /> Save Configuration
          </button>
        </form>
      </div>

      {/* Card 3: 📋 Setup Notes */}
      <div className="payment-card-dark">
        <h2 className="payment-card-title">
          <FileText size={20} color="#f59e0b" /> Setup Notes
        </h2>

        {/* Paystack Note */}
        <div className="setup-note-block blue-accent">
          <h4 className="setup-note-title">Paystack</h4>
          <p className="setup-note-text">
            Use your own Paystack public and secret keys if you want store customers to pay into your Paystack account.
          </p>
        </div>

        {/* Mooire Note */}
        <div className="setup-note-block purple-accent">
          <h4 className="setup-note-title">Mooire</h4>
          <p className="setup-note-text">
            Use the Mooire username, API token/public key, merchant account number, and base URL issued for your business account.
          </p>
        </div>
      </div>
    </div>
  );
};
