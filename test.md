
1. Stockage S3 / MinIO

Option A : MinIO en local (Gratuit, illimité)

# Avec Docker
docker run -p 9000:9000 -p 9001:9001 \
-e MINIO_ROOT_USER=minioadmin \
-e MINIO_ROOT_PASSWORD=minioadmin123 \
minio/minio server /data --console-address ":9001"
→ Console : http://localhost:9001
→ Valeurs pour le formulaire :
- Access Key: minioadmin
- Secret Key: minioadmin123
- Endpoint: http://localhost:9000
- Bucket: créer via la console
- Use Path Style: ✅ coché

Option B : Cloudflare R2 (Gratuit - 10 Go)

🔗 https://dash.cloudflare.com/ → R2 Object Storage
- 10 Go gratuits/mois
- Compatible S3

Option C : Backblaze B2 (Gratuit - 10 Go)

🔗 https://www.backblaze.com/b2/sign-up.html
- 10 Go gratuits
- Compatible S3

  ---
2. Base de données MySQL

Option A : PlanetScale (Gratuit)

🔗 https://planetscale.com/
- 5 Go gratuits
- MySQL compatible
- Très recommandé pour les tests

Option B : Aiven (Gratuit - 30 jours)

🔗 https://aiven.io/free-mysql-database
- MySQL gratuit pendant 30 jours

Option C : Railway (Gratuit - $5 crédit)

🔗 https://railway.app/
- MySQL avec $5 de crédit gratuit
- Très simple à configurer

Option D : TiDB Cloud (Gratuit)

🔗 https://tidbcloud.com/
- 5 Go gratuits
- Compatible MySQL

  ---
3. Redis (Cache & Queue)

Option A : Upstash (Gratuit - 10,000 commandes/jour)

🔗 https://upstash.com/
- Meilleure option gratuite pour Redis
- 10,000 commandes/jour gratuites
- Pas de carte bancaire requise

Option B : Redis Cloud (Gratuit - 30 Mo)

🔗 https://redis.com/try-free/
- 30 Mo gratuits
- Redis officiel

Option C : Railway (Gratuit - $5 crédit)

🔗 https://railway.app/
- Redis avec $5 de crédit

  ---
4. Email (Amazon SES alternative)

Option A : Resend (Gratuit - 3000 emails/mois)

🔗 https://resend.com/
- 3000 emails/mois gratuits
- API simple

Option B : Brevo/Sendinblue (Gratuit - 300 emails/jour)

🔗 https://www.brevo.com/
- 300 emails/jour gratuits

Option C : Mailgun (Gratuit - 5000 emails/mois pendant 3 mois)

🔗 https://www.mailgun.com/

  ---
5. Meilisearch

Option A : Meilisearch Cloud (Gratuit - 14 jours)

🔗 https://cloud.meilisearch.com/
- 14 jours d'essai gratuit

Option B : En local avec Docker (Gratuit, illimité)

docker run -p 7700:7700 \
-e MEILI_MASTER_KEY=masterKey123 \
getmeili/meilisearch
→ Valeurs pour le formulaire :
- URL: http://localhost:7700
- API Key: masterKey123


re_Fa9ZJ4JT_MdUD8xZt1YpUmBVMvNAQhbhF
