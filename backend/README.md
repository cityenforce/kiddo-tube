# KiddoTube-backend

Child passwords are stored as bcrypt hashes for login verification and as
AES-256-GCM ciphertext for parent-only password viewing. Set
`CHILD_PASSWORD_ENCRYPTION_KEY` in the backend environment to a unique,
base64-encoded 32-byte key before creating or resetting child passwords. For
example, generate a key with:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Keep this key outside source control and separate from the database. Losing or
changing it prevents decrypting existing child passwords; those passwords must
then be reset.
