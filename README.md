# yup
an easy to use link shortener

# screenshot
![the website](https://cdn.fromdumo.com/yupv1.png)

# how to run locally
```bash
git clone https://github.com/dumorando/yup
cd yup

# mongodb installation script here

bun i
bun run index.ts
```

# api
```http
POST https://yup.lol/v1/link

{
    "url": "https://dumorando.com"
}
```
returns
```json
{
    "success": true,
    "code": "abcde"
}
```