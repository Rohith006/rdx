import passport from 'passport';

export const passportJwt = passport.authenticate('jwt', {session: false});
export const passportLocal = passport.authenticate('local', {session: false});
export const passportSignInAsLocal = passport.authenticate('local-signin-as', {session: false});
