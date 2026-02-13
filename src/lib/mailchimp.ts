import mailchimp from '@mailchimp/mailchimp_marketing';
import crypto from 'crypto';

const API_KEY = process.env.MAILCHIMP_API_KEY;
const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;
const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;

if (API_KEY && SERVER_PREFIX) {
  mailchimp.setConfig({
    apiKey: API_KEY,
    server: SERVER_PREFIX,
  });
}

export const addSubscriber = async (email: string) => {
  if (!API_KEY || !AUDIENCE_ID || !SERVER_PREFIX) {
    console.warn('Mailchimp environment variables are not set.');
    return null;
  }

  try {
    const response = await mailchimp.lists.addListMember(AUDIENCE_ID, {
      email_address: email,
      status: 'pending', // This triggers double opt-in email
    });
    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // If user is already subscribed, handle it gracefully
    if (error.response && error.response.body.title === 'Member Exists') {
      console.log('Member already exists, checking status...');

      const subscriberHash = crypto
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

      try {
        const member = await mailchimp.lists.getListMember(
          AUDIENCE_ID,
          subscriberHash
        );

        if (member.status === 'subscribed') {
          return { status: 'exists' };
        } else if (member.status === 'unsubscribed' || member.status === 'cleaned' || member.status === 'pending') {
          // Resubscribe them
          const updateResponse = await mailchimp.lists.updateListMember(
            AUDIENCE_ID,
            subscriberHash,
            {
              status: 'pending',
            }
          );
          return updateResponse;
        }
      } catch (innerError) {
        console.error('Error checking member status:', innerError);
        throw innerError;
      }
    }
    console.error('Mailchimp addSubscriber error:', error);
    throw error;
  }
};

export const removeSubscriber = async (email: string) => {
  if (!API_KEY || !AUDIENCE_ID || !SERVER_PREFIX) {
    console.warn('Mailchimp environment variables are not set.');
    return null;
  }

  const subscriberHash = crypto
    .createHash('md5')
    .update(email.toLowerCase())
    .digest('hex');

  try {
    const response = await mailchimp.lists.updateListMember(
      AUDIENCE_ID,
      subscriberHash,
      {
        status: 'unsubscribed',
      }
    );
    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.status === 404) {
        return { status: 'not_found' };
    }
    console.error('Mailchimp removeSubscriber error:', error);
    throw error;
  }
};
