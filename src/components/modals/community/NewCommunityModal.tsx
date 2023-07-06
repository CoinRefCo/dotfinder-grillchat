import ChatIcon from '@/assets/icons/bubble-chat.svg'
import HubIcon from '@/assets/icons/hub.svg'
import MegaphoneIcon from '@/assets/icons/megaphone.svg'
import ExtendedMenuList, {
  ExtendedMenuListProps,
} from '@/components/ExtendedMenuList'
import { useState } from 'react'
import Modal, { ModalFunctionalityProps } from '../Modal'
import UpsertChatModal from './UpsertChatModal'

export type NewCommunityModalProps = ModalFunctionalityProps & {
  hubId: string
}

export default function NewCommunityModal({
  hubId,
  ...props
}: NewCommunityModalProps) {
  const [openedModalState, setOpenedModalState] = useState<null | 'chat'>(null)

  const menus: ExtendedMenuListProps['menus'] = [
    {
      title: 'Chat',
      description: 'Anyone can participate in a public conversation',
      icon: ChatIcon,
      firstVisitNotificationStorageName: 'new-community-chat',
      onClick: () => setOpenedModalState('chat'),
    },
    {
      title: 'Channel',
      description: 'Only you can post updates and others can comment on them',
      icon: MegaphoneIcon,
      isComingSoon: true,
    },
    {
      title: 'Hub',
      description: 'A collection of related chats or channels',
      icon: HubIcon,
      isComingSoon: true,
    },
  ]

  return (
    <>
      <Modal
        {...props}
        isOpen={props.isOpen && openedModalState === null}
        title='💭 New Community'
        withCloseButton
      >
        <ExtendedMenuList menus={menus} />
      </Modal>
      <UpsertChatModal
        isOpen={openedModalState === 'chat'}
        closeModal={() => setOpenedModalState(null)}
        hubId={hubId}
        onBackClick={() => setOpenedModalState(null)}
      />
    </>
  )
}
