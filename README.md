# Prompteus Sandbox

A lightweight web application for testing and interacting with Prompteus Neurons. This Sandbox provides a simple interface for making API calls to any Neuron endpoint.

## Features

- **Interactive Testing**: Enter your Neuron path and input, then see the results in real-time
- **Authentication Support**: Securely provide API keys or JWT tokens for protected Neurons
- **Client-Side Processing**: All API calls are processed directly in your browser
- **Cache Control**: Easily bypass cache for testing with fresh responses
- **Open Source**: The entire application is available on GitHub

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Using the Sandbox

1. **Neuron Path**: Enter your Neuron's path in the format `organization/neuron-slug`
2. **Authentication** (Optional): If your Neuron requires authentication, enter your API key or JWT token
3. **Input**: Type your input in the text area
4. **Cache Control**: Toggle the "Bypass Cache" option if you need fresh responses
5. **Run**: Click the "Run" button to execute the Neuron and see the results

The Sandbox respects all Neuron security settings. If a Neuron requires authentication, you'll need to provide valid credentials to access it.

## Contributing

The Sandbox is open source and available on [GitHub](https://github.com/prompteus-ai/sandbox). We welcome contributions from the community, whether it's bug fixes, feature improvements, or documentation updates.

## Learn More

To learn more about Prompteus and its features, visit:
- [Prompteus Documentation](https://docs.prompteus.com)
- [Prompteus Sandbox Documentation](https://docs.prompteus.com/features/sandbox)
