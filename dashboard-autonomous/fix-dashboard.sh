#!/bin/bash
# This will update the invoice object access from invoice.property to invoice[index]

sed -i 's/inv\.status/inv[4]/g' index.html
sed -i 's/invoice\.status/invoice[4]/g' index.html
sed -i 's/invoice\.description/invoice[5]/g' index.html
sed -i 's/invoice\.amount/invoice[3]/g' index.html
sed -i 's/invoice\.id/invoice[0]/g' index.html
sed -i 's/invoice\.createdAt/invoice[8]/g' index.html
sed -i 's/invoice\.paidAt/invoice[9]/g' index.html
sed -i 's/invoice\.payer/invoice[1]/g' index.html
sed -i 's/invoice\.payee/invoice[2]/g' index.html

echo "✅ Dashboard JavaScript fixed!"
