rem Generate a Private Key
rem To generate a private key we need to install OpenSSL,
rem a full-featured toolkit for the Transport Layer Security (TLS) and Secure Sockets Layer (SSL) protocols,
rem on our local machine. These articles can help you install it.
openssl genrsa -out key.pem

rem Create a CSR (Certificate Signing Request)
rem Since we are our own certificate authority, we need to use CSR to generate our certificate.
rem To do so we need to run the below command.
openssl req -new -key key.pem -out csr.pem

rem Generate the SSL Certificate
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem
