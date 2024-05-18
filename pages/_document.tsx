import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="manifest" href="/manifest.json" />
          {/* Add other head elements here */}
        </Head>
        <body className="bg-darkk">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
