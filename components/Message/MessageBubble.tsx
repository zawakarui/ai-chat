import { Message } from '@/types/chat';
import { useState } from 'react';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const isUser = message.role === 'user';
  const timestamp = new Date(message.timestamp).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const hasImage = message.imageData && message.imageType;
  const imageUrl = hasImage ? `data:${message.imageType};base64,${message.imageData}` : null;

  return (
    <>
      <div className={`${styles.messageWrapper} ${isUser ? styles.userWrapper : styles.assistantWrapper}`}>
        <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
          {/* 画像表示 */}
          {imageUrl && (
            <div className={styles.imageContainer}>
              <img
                src={imageUrl}
                alt={message.imageName || '添付画像'}
                className={styles.messageImage}
                onClick={() => setIsImageModalOpen(true)}
              />
              {message.imageName && (
                <div className={styles.imageCaption}>{message.imageName}</div>
              )}
            </div>
          )}

          {/* テキスト表示 */}
          {message.content && (
            <div className={styles.content}>{message.content}</div>
          )}

          <div className={styles.timestamp}>{timestamp}</div>
        </div>
      </div>

      {/* 画像拡大モーダル */}
      {isImageModalOpen && imageUrl && (
        <div className={styles.imageModal} onClick={() => setIsImageModalOpen(false)}>
          <div className={styles.imageModalContent}>
            <button
              className={styles.closeButton}
              onClick={() => setIsImageModalOpen(false)}
              aria-label="閉じる"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={styles.closeIcon}
              >
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
            <img
              src={imageUrl}
              alt={message.imageName || '添付画像'}
              className={styles.imageModalImage}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
