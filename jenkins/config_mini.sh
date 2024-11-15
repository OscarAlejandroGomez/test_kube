# Encode certificate-authority file
CERT_AUTH=$(base64 -w 0 /home/nuvu/.minikube/ca.crt)

# Encode client-certificate file
CLIENT_CERT=$(base64 -w 0 /home/nuvu/.minikube/profiles/minikube/client.crt)

# Encode client-key file
CLIENT_KEY=$(base64 -w 0 /home/nuvu/.minikube/profiles/minikube/client.key)

# Replace certificate-authority
sed -i "s|certificate-authority: /home/nuvu/.minikube/ca.crt|certificate-authority-data: $CERT_AUTH|" ~/.kube/config

# Replace client-certificate
sed -i "s|client-certificate: /home/nuvu/.minikube/profiles/minikube/client.crt|client-certificate-data: $CLIENT_CERT|" ~/.kube/config

# Replace client-key
sed -i "s|client-key: /home/nuvu/.minikube/profiles/minikube/client.key|client-key-data: $CLIENT_KEY|" ~/.kube/config

cat ~/.kube/config




sudo usermod -a -G docker jenkins

#Y guardar secreto y crear conexion y nube de kubernetes 


# Descargar minikube official
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

sudo install minikube-linux-amd64 /usr/local/bin/minikube



# Instalar krew y despues kuttl
kubectl krew install kuttl