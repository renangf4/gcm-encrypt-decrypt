# Encrypt and Decrypt

A secure, client-side React application for encrypting and decrypting text using password-based encryption. All encryption/decryption happens locally in your browser - no data is ever sent to any server.

## 🔒 Security

This application uses industry-standard cryptographic algorithms:

- **AES-256-GCM** for encryption (authenticated encryption with Galois/Counter Mode)
- **PBKDF2** with SHA-256 for key derivation (210,000 iterations by default)
- **Random salt** (16 bytes) and **random IV** (12 bytes) generated for each encryption
- **Format versioning** in encrypted output for future compatibility

### ⚠️ Security Warnings

**Browser Trust Assumptions:**
- This application runs entirely in your browser using the Web Crypto API
- Encryption/decryption happens locally - **no network calls or data storage**
- However, you must trust:
  - Your browser and its security updates
  - Any browser extensions you have installed
  - The device you're using (malware can compromise security)
  - The network you're on (for the initial page load only)

**Best Practices:**
- Use a strong, unique password (12+ characters recommended)
- Never use on untrusted devices or public networks for initial load
- Clear sensitive data after use (the app does this automatically)
- Consider using a password manager for strong passwords

**What This App Protects:**
- ✅ Protects against passive eavesdropping
- ✅ Protects data at rest (encrypted text storage)
- ✅ Detects tampering (GCM authentication tag)

**What This App Does NOT Protect:**
- ❌ Active man-in-the-middle attacks during initial page load
- ❌ Malicious browser extensions
- ❌ Device-level malware
- ❌ Keyloggers on your system
- ❌ Social engineering (you giving your password away)

## 🚀 Installation

```bash
npm install
```

## 🏃 Run

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 📝 Usage

1. **Encrypt**: Enter your text and password, click "Encrypt"
   - The encrypted output is in format: `base64(version || salt || iv || ciphertext)`
   - Format version is included for future compatibility
   - Click the copy button to copy encrypted text to clipboard
   - Password strength indicator provides feedback based on length

2. **Decrypt**: Paste encrypted text and enter the password, click "Decrypt"
   - The app will verify data integrity using GCM authentication
   - If password is wrong or data was tampered, decryption fails with a generic error
   - Click the copy button to copy decrypted text to clipboard

**Features:**
- 👁️ Toggle password visibility with the eye icon
- 📋 Copy encrypted/decrypted text with one click
- 🔒 Password strength feedback (length-based)

## 🔧 Configuration

The PBKDF2 iteration count is configurable (default: 210,000). This is documented in `src/cryptoUtils.js`. Lower values reduce security but improve performance on slower devices. **The default 210,000 is recommended for maximum security as of 2024.**

## 🛡️ Data Protection

- Sensitive data (passwords, plaintext) is cleared from state immediately after encryption/decryption
- Passwords are never displayed in plaintext
- All operations are client-side only (offline capable after initial load)

## 📚 Technical Details

- **Encryption Format**: Version (1 byte) || Salt (16 bytes) || IV (12 bytes) || Ciphertext
- **Key Derivation**: PBKDF2-HMAC-SHA-256 with configurable iterations
- **Encryption Algorithm**: AES-256-GCM (256-bit key, Galois/Counter Mode)
- **Authentication**: Built into GCM mode (detects tampering)

## 🔄 Backward Compatibility

The encrypted format includes a version byte, allowing future format upgrades while maintaining compatibility with older encrypted data.

## 📄 License

This project is open source. Use responsibly and at your own risk.
