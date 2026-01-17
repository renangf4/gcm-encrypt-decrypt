import React, { useState, useEffect } from 'react';
import { encrypt, decrypt } from './cryptoUtils';
import { evaluatePasswordStrength } from './passwordStrength';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [passwordEncrypt, setPasswordEncrypt] = useState('');
  const [passwordDecrypt, setPasswordDecrypt] = useState('');
  const [encrypted, setEncrypted] = useState('');
  const [encryptedToDecrypt, setEncryptedToDecrypt] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [showPasswordEncrypt, setShowPasswordEncrypt] = useState(false);
  const [showPasswordDecrypt, setShowPasswordDecrypt] = useState(false);
  const [copiedEncrypted, setCopiedEncrypted] = useState(false);
  const [copiedDecrypted, setCopiedDecrypted] = useState(false);

  useEffect(() => {
    if (passwordEncrypt) {
      setPasswordStrength(evaluatePasswordStrength(passwordEncrypt));
    } else {
      setPasswordStrength(null);
    }
  }, [passwordEncrypt]);

  useEffect(() => {
    return () => {
      setPasswordEncrypt('');
      setPasswordDecrypt('');
      setText('');
      setDecrypted('');
    };
  }, []);

  const handleEncrypt = async () => {
    if (!passwordEncrypt) {
      setError('Password is required');
      return;
    }
    if (!text) {
      setError('Fill in the text');
      return;
    }
    setError('');
    setIsLoading(true);
    
    let textToEncrypt = text;
    let passwordToUse = passwordEncrypt;
    
    try {
      const encryptedText = await encrypt(textToEncrypt, passwordToUse);
      setEncrypted(encryptedText);
      setDecrypted('');
      
      setText('');
      setPasswordEncrypt('');
    } catch (err) {
      setError('Error encrypting: ' + err.message);
    } finally {
      setIsLoading(false);
      textToEncrypt = null;
      passwordToUse = null;
    }
  };

  const handleDecrypt = async () => {
    if (!encryptedToDecrypt || !passwordDecrypt) {
      setError('Fill in the encrypted text and password');
      return;
    }
    setError('');
    setIsLoading(true);
    
    let encryptedData = encryptedToDecrypt;
    let passwordToUse = passwordDecrypt;
    
    try {
      const decryptedText = await decrypt(encryptedData, passwordToUse);
      setDecrypted(decryptedText);
      
      setPasswordDecrypt('');
    } catch (err) {
      setError(err.message || 'Decryption failed: incorrect password or tampered data');
      setDecrypted('');
    } finally {
      setIsLoading(false);
      encryptedData = null;
      passwordToUse = null;
    }
  };

  const handleDecryptFromInput = async () => {
    if (!encryptedToDecrypt || !passwordDecrypt) {
      setError('Fill in the encrypted text and password');
      return;
    }
    await handleDecrypt();
  };

  const handleCopyEncrypted = async () => {
    try {
      await navigator.clipboard.writeText(encrypted);
      setCopiedEncrypted(true);
      setTimeout(() => setCopiedEncrypted(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleCopyDecrypted = async () => {
    try {
      await navigator.clipboard.writeText(decrypted);
      setCopiedDecrypted(true);
      setTimeout(() => setCopiedDecrypted(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">Encryption and Decryption with Password</h1>
        <p className="description">
          Tool to encrypt and decrypt text using AES-256-GCM encryption with password. 
          Uses PBKDF2 key derivation with 210,000 iterations for maximum security. 
          Encrypt your data securely and recover it using the same password.
        </p>
        
        <div className="security-warning">
          <strong>⚠️ Security Notice:</strong> This application runs entirely in your browser. 
          Encryption/decryption happens locally - no data is sent to any server. However, 
          you must trust your browser and any extensions you have installed. Never use on 
          untrusted devices or networks.
        </div>
        
        <div className="section">
          <h2 className="section-title">Encrypt</h2>
          <div className="input-group">
            <label>Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text to be encrypted"
              rows="4"
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type="password"
                autoComplete="new-password"
                style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
                tabIndex="-1"
                readOnly
              />
              <input
                type={showPasswordEncrypt ? "text" : "password"}
                value={passwordEncrypt}
                onChange={(e) => setPasswordEncrypt(e.target.value)}
                placeholder="Enter the password"
                autoComplete="new-password"
                name="encrypt-password-field"
                data-form-type="other"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPasswordEncrypt(!showPasswordEncrypt)}
                aria-label={showPasswordEncrypt ? "Hide password" : "Show password"}
              >
                {showPasswordEncrypt ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {passwordStrength && (
              <div className={`password-strength password-strength-${passwordStrength.strength}`}>
                {passwordStrength.message}
              </div>
            )}
          </div>
          <button onClick={handleEncrypt} className="btn btn-encrypt" disabled={isLoading}>
            {isLoading ? 'Encrypting...' : 'Encrypt'}
          </button>
          {encrypted && (
            <div className="result-box">
              <div className="result-header">
                <label>Encrypted Text</label>
                <button
                  type="button"
                  className="copy-button"
                  onClick={handleCopyEncrypted}
                  aria-label="Copy encrypted text"
                >
                  {copiedEncrypted ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  )}
                </button>
              </div>
              <textarea
                value={encrypted}
                readOnly
                rows="4"
                className="result-text"
              />
            </div>
          )}
        </div>

        <div className="section">
          <h2 className="section-title">Decrypt</h2>
          <div className="input-group">
            <label>Encrypted Text</label>
            <textarea
              value={encryptedToDecrypt}
              onChange={(e) => setEncryptedToDecrypt(e.target.value)}
              placeholder="Paste the encrypted text"
              rows="4"
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type="password"
                autoComplete="new-password"
                style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
                tabIndex="-1"
                readOnly
              />
              <input
                type={showPasswordDecrypt ? "text" : "password"}
                value={passwordDecrypt}
                onChange={(e) => setPasswordDecrypt(e.target.value)}
                placeholder="Enter the password"
                autoComplete="new-password"
                name="decrypt-password-field"
                data-form-type="other"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPasswordDecrypt(!showPasswordDecrypt)}
                aria-label={showPasswordDecrypt ? "Hide password" : "Show password"}
              >
                {showPasswordDecrypt ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button onClick={handleDecryptFromInput} className="btn btn-decrypt" disabled={isLoading}>
            {isLoading ? 'Decrypting...' : 'Decrypt'}
          </button>
          {decrypted && (
            <div className="result-box">
              <div className="result-header">
                <label>Decrypted Text</label>
                <button
                  type="button"
                  className="copy-button"
                  onClick={handleCopyDecrypted}
                  aria-label="Copy decrypted text"
                >
                  {copiedDecrypted ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  )}
                </button>
              </div>
              <textarea
                value={decrypted}
                readOnly
                rows="4"
                className="result-text"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
