#!/bin/bash

# Configuration
STACK_NAME="Biterva-LNBits-Prod"
REGION="us-east-2"

echo "🚀 Iniciando despliegue de infraestructura Biterva..."

# 1. Verificar KeyPair
echo "🔍 Buscando KeyPairs en $REGION..."
aws ec2 describe-key-pairs --region $REGION --query 'KeyPairs[*].KeyName' --output text

read -p "📝 Ingresa el nombre de tu KeyPair de AWS para SSH: " KEY_NAME

# 2. Crear Stack de CloudFormation
echo "🏗️ Creando infraestructura en AWS (Security Groups, EC2, Elastic IP)..."
aws cloudformation create-stack \
  --stack-name $STACK_NAME \
  --template-body file://template.yml \
  --parameters ParameterKey=KeyPairName,ParameterValue=$KEY_NAME \
  --region $REGION \
  --capabilities CAPABILITY_IAM

echo "⏳ Esperando a que AWS termine de crear los recursos (esto tarda ~3 min)..."
aws cloudformation wait stack-create-complete --stack-name $STACK_NAME --region $REGION

# 3. Obtener IP Pública
PUBLIC_IP=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs[?OutputKey==`PublicIP`].OutputValue' --output text)

echo "✅ Infraestructura lista!"
echo "📍 IP Pública Fija: $PUBLIC_IP"
echo "🔗 URL de LNBits: http://$PUBLIC_IP:7777"

# 4. Preparar archivos para subir
echo "📦 Preparando archivos de configuración..."
cp docker-compose.yml remote-docker-compose.yml
# Inyectar IP publica en el docker-compose remoto
sed -i '' "s/\${PUBLIC_IP}/$PUBLIC_IP/g" remote-docker-compose.yml

# 5. Instrucciones finales
echo ""
echo "----------------------------------------------------------------"
echo "🔥 CASI LISTO, CRACK! Ahora solo falta subir el código al EC2:"
echo "----------------------------------------------------------------"
echo "Ejecuta estos pasos para terminar:"
echo "1. copia los archivos al servidor:"
echo "   scp -i tu-llave.pem remote-docker-compose.yml ubuntu@$PUBLIC_IP:/home/ubuntu/lnbits/docker-compose.yml"
echo "   scp -i tu-llave.pem ../../.env ubuntu@$PUBLIC_IP:/home/ubuntu/lnbits/.env"
echo ""
echo "2. Entra al servidor y arranca Docker:"
echo "   ssh -i tu-llave.pem ubuntu@$PUBLIC_IP"
echo "   cd lnbits && sudo docker compose up -d"
echo "----------------------------------------------------------------"
