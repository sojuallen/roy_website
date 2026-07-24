export default function handler(req, res) {
  res.status(200).json({
    name: 'github',
    authorize_url: 'https://github.com/login/oauth/authorize',
    scope: 'repo,user'
  });
}
