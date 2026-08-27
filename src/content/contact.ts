/** Content for `/contact`. Branch details live in `site.ts`. */

export const contactPage = {
  /** Split over two lines so the light-weight display type breaks predictably. */
  headline: ["We'd Love to Hear", 'From You!'],
  description:
    'Get a quote from Cebu GraphicStar. Message us online or visit our Ayala, SM City Cebu or Mandaue branches.',
  form: {
    submitLabel: 'Contact Us',
    submittingLabel: 'Sending…',
    successTitle: 'Thank you!',
    successBody:
      'Your message is on its way to our team. We usually reply within one business day.',
    errorBody: 'Something went wrong while sending your message. Please try again, or call us directly.',
    fields: [
      { name: 'name', label: 'Name', placeholder: 'Enter your name', type: 'text', autoComplete: 'name' },
      {
        name: 'email',
        label: 'E-mail',
        placeholder: 'Enter your e-mail',
        type: 'email',
        autoComplete: 'email',
      },
      {
        name: 'phone',
        label: 'Contact Number',
        placeholder: 'Enter your contact number',
        type: 'tel',
        autoComplete: 'tel',
      },
      {
        name: 'message',
        label: 'Message',
        placeholder: 'Enter your message',
        type: 'textarea',
        autoComplete: 'off',
      },
    ],
  },
  branchesHeading: 'Visit us at any of our branches:',
} as const;

export type ContactField = (typeof contactPage.form.fields)[number];
