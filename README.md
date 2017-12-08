# hin - Http INterceptor
> Intercept, inspect, manipulate HTTP/HTTPS traffic

## Install
```
$ npm install -g hin
```

## Update
```
$ npm update -g hin
```

## Usage

First time run:
```
$ hin
```
will generate private key and Root CA certificate inside `~/.hin` folder.
Proxy will be listening in 8001 port by default. To specify custom port use `--port` option:
```
$ hin --port 4001
```

Next time you run `Http Interceptor` it will check for generated certificate and use it. In addition you can specify path to custom private key and Root CA certificate:
```
$ hin --cert <path_to_root_cartificate> --key <path_to_private_key>
```

You can re-generate private key and Root CA certificate by using `--generate` option:
```
$ hin --generate
```

For Http Interceptor to be able to intercept SSL traffic you need to add generated Root CA to Trusted Roots.

## MacOS
The following command will add generated certificate to your login keychain and mark as trusted:
```
$ security add-trusted-cert -d -r trustRoot -k ~/Library/Keychains/login.keychain ~/.hin/_ca.crt
```
## Linux
### Debian, Ubuntu
```bash
$ sudo cp ~/.hin/_ca.crt /usr/local/share/ca-certificates/hin_ca.crt
$ sudo chmod 644 /usr/local/share/ca-certificates/hin_ca.crt
$ sudo update-ca-certificates
```

### Fedora
```bash
$ sudo cp ~/.hin/_ca.crt /etc/pki/ca-trust/source/anchors/hin_ca.crt
$ sudo update-ca-trust
```

### Arch
```bash
$ sudo cp ~/.hin/_ca.crt /etc/ca-certificates/trust-source/anchors/hin_ca.crt
$ sudo update-ca-trust
```

## Windows
The following powershell commands will add generated certificate to current user's Trusted Root Certification Authorities list:
```powershell
PS> Import-Module pki
PS> Import-Certificate -FilePath "${env:USERPROFILE}\.hin\_ca.crt" -CertStoreLocation Cert:\CurrentUser\Root
```

## Firefox
Firefox manages its own certificate authorities list.
Open [Preferences (about:preferences)](about:preferences) `View Certificates` section and import generated Root CA certificate. You need to check `'This certificate can identify websites.'` during import.

## Chromium
Chromium manages its own certificate authorities list.
Open [Certificate Settings (chrome://settings/certificates)](chrome://settings/certificates) `Authorities` section and import generated Root CA certificate. You need to check `'Trust this certificate for identifying websites'` during import.
