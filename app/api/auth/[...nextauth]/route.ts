import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Ensure your environment variables are defined
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "Missing Google OAuth credentials. Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in your .env file."
  );
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  // You can add more configurations here if needed, like:
  // secret: process.env.NEXTAUTH_SECRET, // A secret for signing cookies, highly recommended for production
  // pages: {
  //   signIn: '/auth/signin', // If you want a custom sign-in page
  // },
  // callbacks: {
  //   async jwt({ token, account }) {
  //     // Persist the OAuth access_token to the token right after signin
  //     if (account) {
  //       token.accessToken = account.access_token
  //     }
  //     return token
  //   },
  //   async session({ session, token, user }) {
  //     // Send properties to the client, like an access_token from a provider.
  //     session.accessToken = token.accessToken;
  //     return session
  //   }
  // }
});

export { handler as GET, handler as POST }; 