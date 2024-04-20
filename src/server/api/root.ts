import { createTRPCRouter } from '~/server/api/trpc';
import { accountRouter } from './routers/account';
import { hkExperienceRouter } from './routers/hk-experience';
import { ingameAuthRouter } from './routers/ingameauth';
import { runInteractionRouter } from './routers/run-interaction/run-interaction';
import { runRouter } from './routers/run/run';
import { studyDemographicsRouter } from './routers/study-demographics';
import { studyParticipationRouter } from './routers/study-participation';
import { participantRouter } from './routers/study/participant';
import { userStudyInformedConsentRouter } from './routers/study/user-study-informed-consent';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    run: runRouter,
    runInteraction: runInteractionRouter,
    ingameAuth: ingameAuthRouter,
    account: accountRouter,
    studyParticipation: studyParticipationRouter,
    studyDemographics: studyDemographicsRouter,
    hkExperience: hkExperienceRouter,
    participant: participantRouter,
    userStudyInformedConsent: userStudyInformedConsentRouter,
});
