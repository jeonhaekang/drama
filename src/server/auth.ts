export const getToken = async (code: string) => {
  const token = await fetch("https://api.shop-pro.jp/oauth/token", {
    method: "POST",
    body: new URLSearchParams({
      code,
      client_id: process.env.NEXT_PUBLIC_COLOR_ME_CLIENT_ID as string,
      client_secret: process.env.NEXT_PUBLIC_COLOR_ME_CLIENT_PASSWORD as string,
      redirect_uri: process.env.NEXT_PUBLIC_REDIRECT as string,
      grant_type: "authorization_code",
    }),
  }).then((res) => res.json() as Promise<{ access_token: string }>);

  return token.access_token;
};
