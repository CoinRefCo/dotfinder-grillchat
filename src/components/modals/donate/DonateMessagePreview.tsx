import Button from '@/components/Button'
import RepliedMessagePreview from '@/components/chats/ChatItem/RepliedMessagePreview'
import { ChatItemContentProps } from '@/components/chats/ChatItem/variants/types'
import LinkText from '@/components/LinkText'
import Name from '@/components/Name'
import { cx } from '@/utils/class-names'
import Linkify from 'linkify-react'
import { HiArrowUpRight } from 'react-icons/hi2'
import { IoCheckmarkDoneOutline, IoCheckmarkOutline } from 'react-icons/io5'

type DonatePreviewProps = {
  extensionProps?: any
  isMyMessage: boolean
}

const DonatePreview = ({ extensionProps, isMyMessage }: DonatePreviewProps) => {
  if (!extensionProps) return null

  const { token, amount, txHash } = extensionProps

  return (
    <div className={cx('px-5 pt-5', { ['mb-3']: !isMyMessage })}>
      <LinkText
        openInNewTab
        href={`https://polygonscan.com/tx/${txHash}`}
        variant='primary'
      >
        <div className='flex flex-col items-center gap-2 text-white'>
          <div className='flex items-start gap-2'>
            <div className='text-3xl font-bold leading-[26px]'>
              {amount} {token}
            </div>
            <HiArrowUpRight />
          </div>
          <div className='text-sm'>≈ $34.57</div>
        </div>
      </LinkText>
    </div>
  )
}

export type DefaultChatItemProps = ChatItemContentProps

export default function DonateMessagePreview({
  isMyMessage,
  isSent,
  onCheckMarkClick,
  body,
  ownerId,
  relativeTime,
  senderColor,
  inReplyTo,
  extensions,
  scrollToMessage,
  ...props
}: DefaultChatItemProps) {
  const { properties } = extensions?.[0] || {}

  return (
    <div className={cx('flex flex-col', props.className)}>
      <div
        className={cx(
          'relative flex flex-col gap-0.5 overflow-hidden rounded-2xl px-2.5 py-1.5',
          'bg-gradient-to-br from-[#C43333] to-[#F9A11E]'
        )}
      >
        {!isMyMessage && (
          <div className='flex items-center'>
            <Name ownerId={ownerId} senderColor={senderColor} />
            <span className='text-xs text-[#F9DBC3]'>{relativeTime}</span>
          </div>
        )}
        {inReplyTo && (
          <RepliedMessagePreview
            originalMessage={body}
            className='mt-1'
            repliedMessageId={inReplyTo.id}
            scrollToMessage={scrollToMessage}
          />
        )}
        <p className='whitespace-pre-wrap break-words text-base'>
          <Linkify
            options={{
              render: ({ content, attributes }) => (
                <LinkText
                  {...attributes}
                  href={attributes.href}
                  variant={isMyMessage ? 'default' : 'secondary'}
                  className={cx('underline')}
                  openInNewTab
                >
                  {content}
                </LinkText>
              ),
            }}
          >
            {body}
            <div className='mt-[5px] w-full ring-[0.4px] ring-[#F9A11E]'></div>
            <DonatePreview
              extensionProps={properties}
              isMyMessage={isMyMessage}
            />
          </Linkify>
        </p>
        {isMyMessage && (
          <div
            className={cx('flex items-center gap-1', isMyMessage && 'self-end')}
          >
            <span className='text-xs text-[#F9DBC3]'>{relativeTime}</span>
            <Button
              variant='transparent'
              size='noPadding'
              interactive='brightness-only'
              onClick={onCheckMarkClick}
            >
              {isSent ? (
                <IoCheckmarkDoneOutline className='text-sm' />
              ) : (
                <IoCheckmarkOutline className={cx('text-sm')} />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
