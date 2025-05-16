rem Step 1: Generate a Private Key
openssl genrsa -out inventory.key 2048

rem Step 2: Create a Certificate Signing Request (CSR)
openssl req -new -key inventory.key -out inventory.csr

rem Step 3: Generate the Self-Signed Certificate
openssl x509 -req -days 365 -in inventory.csr -signkey inventory.key -out inventory.crt

rem Step 4: Verify the Certificate
rem openssl x509 -text -noout -in inventory.crt