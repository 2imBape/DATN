declare module "react-facebook-login" {
  interface FacebookLoginResponse {
    accessToken: string;
    userID: string;
    expiresIn: number;
    name: string;
    email: string;
    picture: { data: { url: string } };
  }

  interface FacebookLoginProps {
    appId: string;
    autoLoad?: boolean;
    fields?: string;
    scope?: string;
    callback: (response: FacebookLoginResponse) => void;
    textButton?: string;
  }

  const FacebookLogin: React.FC<FacebookLoginProps>;
  export default FacebookLogin;
}
