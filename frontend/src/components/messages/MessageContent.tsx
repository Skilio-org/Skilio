import Linkify from 'linkify-react';

interface MessageProps {
  content: string;
}

export function MessageContent({ content }: MessageProps) {
  return (
    <Linkify
      options={{
        target: '_blank',
        rel: 'noopener noreferrer',
        defaultProtocol: 'https',
        attributes: {
          className: 'text-primary hover:text-primary/80 hover:underline',
        },
      }}
    >
      {content}
    </Linkify>
  );
}