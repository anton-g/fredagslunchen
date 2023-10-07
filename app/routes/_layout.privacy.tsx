import type { MetaFunction } from "@remix-run/node"
import styled from "styled-components"
import { mergeMeta } from "~/merge-meta"

export const meta: MetaFunction = mergeMeta(() => [
  {
    title: "Privacy Policy - Fredagslunchen",
  },
])

export default function PrivacyPage() {
  return (
    <main>
      <Title>Privacy Policy</Title>
      <p>
        Fredagslunchen.club takes your privacy seriously. To better protect your privacy we provide this
        privacy policy notice explaining the way your personal information is collected and used.
      </p>
      <Subtitle>Cookies</Subtitle>
      <p>
        Where necessary, this website uses cookies to store information about a visitor’s preferences and
        history in order to better serve the user and/or present the user with customized content.
      </p>
      <Subtitle>Advertisement and Other Third Parties</Subtitle>
      <p>
        We do not use any cookies to track users or visitors for any purpose related to advertisements or for
        any third party.
      </p>
      <Subtitle>Collection of Routine Information</Subtitle>
      <p>
        We want to process as little personal information as possible when you use our website. We use Fathom
        Analytics for our website analytics, which doesn't use cookies and complies with the GDPR, ePrivacy
        (including PECR), COPPA and CCPA. Your IP address is only briefly processed, and we have no way of
        identifying you. As per the CCPA, your personal information is de-identified.
      </p>
      <p>
        The purpose of us using this software is to understand our website traffic in the most
        privacy-friendly way possible so that we can continually improve our website and business. The lawful
        basis as per the GDPR is "Article 6(1)(f); where our legitimate interests are to improve our website
        and business continually." As per the explanation, no personal data is stored over time.
      </p>
      <Subtitle>Security</Subtitle>
      <p>
        The security of your personal information is important to us, but remember that no method of
        transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to
        use commercially acceptable means to protect your personal information, we cannot guarantee its
        absolute security.
      </p>
      <Subtitle>Changes To This Privacy Policy</Subtitle>
      <p>
        This Privacy Policy is effective as of 2022-08-01 and will remain in effect except with respect to any
        changes in its provisions in the future, which will be in effect immediately after being posted on
        this page.
      </p>
      <p>
        We reserve the right to update or change our Privacy Policy at any time and you should check this
        Privacy Policy periodically. If we make any material changes to this Privacy Policy, we will notify
        you either through the email address you have provided us, or by placing a prominent notice on our
        website.
      </p>
      <Subtitle>Contact Information</Subtitle>
      <p>
        For any questions or concerns regarding the privacy policy, please send us an email to
        info@fredagslunchen.club.
      </p>
    </main>
  )
}

const Title = styled.h2`
  font-size: 48px;
  margin: 0;
  margin-bottom: 24px;
`

const Subtitle = styled.h3`
  font-size: 36px;
  margin: 0;
  margin-bottom: 16px;
`
