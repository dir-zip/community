
# dir.zip

dir.zip is an open source community platform inspired by the 90's and early 2000's forum era. Discourse and communication has become more important than ever and feel the current platforms don't facilitate the current landscape.

![dir_zip](https://github.com/dir-zip/community/assets/3496193/fce16ca9-10fb-4d16-95d2-d741a604f7b0)


![GitHub last commit (branch)](https://img.shields.io/github/last-commit/dir-zip/community/main)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

## Features
- Community wide feed
- Rich text editor with TipTap
- Tags
- Gamification
- Badge unlockables
- Item shop
- Inventory system
- File upload
- Email system
- Background jobs
- Admin panel

## Requirements
- S3 compatible storage
- SMTP provider
- Redis server

## 👋 Getting Started

Make sure you create an `.env` file in the root of the monorepo and have all the required variables filled out.

Then run the following commands
```
pnpm install
pnpm db:push && pnpm db:generate
pnpm db:seed
pnpm dev
```

### Environment Variable
| Environment Variable | Required | Example |
| ---- | ---- | ---- |
| `DATABASE_URL` | Yes | `file:./db.sqlite` |
| `SESSION_SECRET` | Yes | `SUPERSECRET` |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` |
| `S3_ACCESS_KEY` | Yes | `minioadmin` |
| `S3_SECRET_KEY` | Yes | `minioadmin` |
| `S3_BUCKET` | Yes | `bucketname` |
| `S3_ENDPOINT` | Yes | `http://127.0.0.1:9000` |
| `S3_MAX_SIZE` | No | `10mb` |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | No | `123` |
| `GITHUB_CLIENT_SECRET` | No | `123` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | No | `123` |
| `GOOGLE_CLIENT_SECRET` | No | `123` |
| `APP_EMAIL` | Yes | `admin@dir.zip` |
| `SMTP_HOST` | Yes | `smtp.postmarkapp.com` |
| `SMTP_PORT` | Yes | `587` |
| `SMTP_USERNAME` | Yes | `123` |
| `SMTP_PASSWORD` | Yes | `123` |
| `REDIS_HOST` | Yes | `http://127.0.0.1` |
| `REDIS_PORT` | Yes | `6379` |

## 🤝 Contributing

Contributions of all types are more than welcome; if you are interested in contributing code, feel free to check out our GitHub Issues.

## 📝 License

Copyright © 2023 [Dillon Raphael](https://twitter.com/dillonraphael).
This project is licensed under the GNU Affero General Public License v3.0.
