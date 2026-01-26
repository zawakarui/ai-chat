'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatSession } from '@/types/chat';
import { loadSession, saveSession, initializeSession } from '@/lib/session';
import { sendChatMessage } from '@/lib/chat-api';
import MessageBubble from '@/components/Message/MessageBubble';
import MessageInput from '@/components/Input/MessageInput';
import styles from './ChatContainer.module.css';

export default function ChatContainer() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingContentRef = useRef<string>('');

  // セッションの初期化と復元
  useEffect(() => {
    const existingSession = loadSession();
    if (existingSession) {
      setSession(existingSession);
      setMessages(existingSession.messages);
    } else {
      const newSession = initializeSession();
      setSession(newSession);
    }
  }, []);

  // 自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const handleSendMessage = async (
    content: string,
    imageData?: string,
    imageType?: string,
    imageName?: string
  ) => {
    if (!session || isLoading) return;

    // ユーザーメッセージを追加
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      imageData,
      imageType,
      imageName,
    };

    const updatedSession: ChatSession = {
      ...session,
      messages: [...session.messages, userMessage],
    };
    setSession(updatedSession);
    setMessages(updatedSession.messages);
    saveSession(updatedSession);

    setIsLoading(true);
    setStreamingMessage('');
    streamingContentRef.current = '';

    // 会話履歴を準備
    const conversationHistory = updatedSession.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      imageData: msg.imageData,
      imageType: msg.imageType,
    }));

    // AIレスポンスを受信
    await sendChatMessage(
      content,
      conversationHistory,
      imageData,
      imageType,
      // onToken: ストリーミング中のトークンを追加
      (token: string) => {
        streamingContentRef.current += token;
        setStreamingMessage(streamingContentRef.current);
      },
      // onComplete: ストリーミング完了時
      () => {
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: streamingContentRef.current,
          timestamp: new Date().toISOString(),
        };

        const newSession: ChatSession = {
          ...updatedSession,
          messages: [...updatedSession.messages, assistantMessage],
        };

        setSession(newSession);
        setMessages(newSession.messages);
        saveSession(newSession);
        setStreamingMessage('');
        streamingContentRef.current = '';
        setIsLoading(false);
      },
      // onError: エラー発生時
      (error: string) => {
        console.error('Chat error:', error);
        const errorMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: `エラーが発生しました: ${error}`,
          timestamp: new Date().toISOString(),
        };

        const newSession: ChatSession = {
          ...updatedSession,
          messages: [...updatedSession.messages, errorMessage],
        };

        setSession(newSession);
        setMessages(newSession.messages);
        saveSession(newSession);
        setStreamingMessage('');
        setIsLoading(false);
      }
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>AI Chat</h1>
      </header>

      <div className={styles.messagesContainer}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <p>こんにちは！何でもお気軽に話しかけてください。</p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {streamingMessage && (
          <div className={styles.streamingMessage}>
            <MessageBubble
              message={{
                id: 'streaming',
                role: 'assistant',
                content: streamingMessage,
                timestamp: new Date().toISOString(),
              }}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
