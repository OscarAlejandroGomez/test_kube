# Encode certificate-authority file
CERT_AUTH=$(base64 -w 0 /home/alejandro/.minikube/ca.crt)

# Encode client-certificate file
CLIENT_CERT=$(base64 -w 0 /home/alejandro/.minikube/profiles/minikube/client.crt)

# Encode client-key file
CLIENT_KEY=$(base64 -w 0 /home/alejandro/.minikube/profiles/minikube/client.key)

# Replace certificate-authority
sed -i "s|certificate-authority: /home/alejandro/.minikube/ca.crt|certificate-authority-data: $CERT_AUTH|" ~/.kube/config

# Replace client-certificate
sed -i "s|client-certificate: /home/alejandro/.minikube/profiles/minikube/client.crt|client-certificate-data: $CLIENT_CERT|" ~/.kube/config

# Replace client-key
sed -i "s|client-key: /home/alejandro/.minikube/profiles/minikube/client.key|client-key-data: $CLIENT_KEY|" ~/.kube/config

cat ~/.kube/config




sudo usermod -a -G docker jenkins

#Y guardar secreto y crear conexion y nube de kubernetes 