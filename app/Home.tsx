import { useStytchSession, useStytchUser } from '@stytch/react';
import { Logout } from './Auth.tsx';

export default function Home() {
  const { user } = useStytchUser();
  const { session } = useStytchSession();

  console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@Stytch Session:', session);


  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-bold mb-6">BigGeo MCP Server Demo</h1>
      <p className="text-gray-500">
        {user && (
          <>
            {' '}
            You are logged in as {user.emails[0].email} <Logout />
          </>
        )}
        {!user && <> You are not logged in</>}
      </p>
      <p className="text-lg">
        Welcome to the BigGeo MCP Demo — a showcase of cutting-edge Geospatial AI capabilities powered by{' '}
        <a
          href="https://biggeo.com"
          className="text-blue-600 hover:underline"
        >
          BigGeo
        </a>
        .
      </p>
      <div>
        <p className="text-lg font-semibold mb-2">
          This demo highlights how advanced location intelligence and data analytics can deliver actionable insights from real-world geospatial data.
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>
            Brand-Level Insights: Retrieve foot traffic data (visitor counts, etc.) for all locations of a brand within a geographic area.
          </li>
          <li>
           Business-Level Insights: Get visitor counts and other metrics for a specific business, or find and compare foot traffic metrics for similar nearby businesses within a given radius.
          </li>
        </ul>
      </div>
      <div>
        <p className="text-lg font-semibold mb-2">To use this demo:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          {/* <li>
            Enable{' '}
            <a
              href="https://platform.openai.com/docs/guides/developer-mode"
              className="text-blue-600 hover:underline"
            >
              Developer Mode
            </a>{' '}
            in ChatGPT
          </li>
          <li>
            Connect to the MCP Server running at{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">
              {import.meta.env.VITE_MCP_URL ??
                'TODO: Configure MCP server Deployment URL'}
            </code>            
          </li> */}
          <li>
            This demo is currently in limited beta. Interested in getting access? Contact our team at{' '}<a href="mailto:sales@biggeo.com" className="text-blue-600 hover:underline">sales@biggeo.com</a>.
          </li>
        </ul>
      </div>
    </div>
  );
}
