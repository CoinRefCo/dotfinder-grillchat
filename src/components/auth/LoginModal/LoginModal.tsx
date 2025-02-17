import InfoPanel from '@/components/InfoPanel'
import Modal, { ModalFunctionalityProps } from '@/components/modals/Modal'
import { isTouchDevice } from '@/utils/device'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { loginModalContents, LoginModalStep } from './LoginModalContent'

const CaptchaInvisible = dynamic(
  () => import('@/components/captcha/CaptchaInvisible'),
  {
    ssr: false,
  }
)

export type LoginModalProps = ModalFunctionalityProps & {
  initialOpenState?: LoginModalStep
  onBackClick?: () => void
  afterLogin?: () => void
  beforeLogin?: () => void
}

type ModalTitle = {
  [key in LoginModalStep]: {
    title: React.ReactNode
    desc: React.ReactNode
    withBackButton?: boolean
    withFooter?: boolean
  }
}

const modalHeader: ModalTitle = {
  login: {
    title: '🔐 Login',
    desc: '',
    withFooter: true,
  },
  'enter-secret-key': {
    title: '🔑 Grill secret key',
    desc: (
      <span className='flex flex-col'>
        <span>
          To access GrillChat, you need a Grill secret key. If you do not have
          one, just write your first chat message, and you will be given one.
        </span>
        <InfoPanel className='mt-4'>
          DO NOT enter the private key of an account that holds any funds,
          assets, NFTs, etc.
        </InfoPanel>
      </span>
    ),
    withBackButton: true,
    withFooter: true,
  },
  'account-created': {
    title: '🎉 Account created',
    desc: 'We have created an anonymous account for you. You can now use Grill.chat!',
  },
  'evm-address-linked': {
    title: '🎉 EVM address linked',
    desc: `Now you can use all of Grill's EVM features such as ERC-20 tokens, NFTs, and other smart contracts.`,
  },
  'evm-linking-error': {
    title: '😕 Something went wrong',
    desc: 'This might be related to the transaction signature. You can try again, or come back to it later.',
    withBackButton: false,
    withFooter: false,
  },
}

export default function LoginModal({
  afterLogin,
  beforeLogin,
  initialOpenState = 'login',
  onBackClick,
  ...props
}: LoginModalProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [currentStep, setCurrentStep] =
    useState<LoginModalStep>(initialOpenState)

  const usedOnBackClick = onBackClick || (() => setCurrentStep('login'))

  useEffect(() => {
    if (props.isOpen) setCurrentStep(initialOpenState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isOpen])

  const ModalContent = loginModalContents[currentStep]
  const { title, desc, withBackButton, withFooter } = modalHeader[currentStep]

  return (
    <Modal
      {...props}
      withFooter={withFooter}
      initialFocus={isTouchDevice() ? undefined : inputRef}
      title={title}
      withCloseButton
      description={desc}
      onBackClick={withBackButton ? usedOnBackClick : undefined}
      closeModal={() => {
        props.closeModal()
      }}
    >
      <CaptchaInvisible>
        {(runCaptcha, termsAndService) => {
          return (
            <ModalContent
              setCurrentStep={setCurrentStep}
              currentStep={currentStep}
              runCaptcha={runCaptcha}
              termsAndService={termsAndService}
              {...props}
            />
          )
        }}
      </CaptchaInvisible>
    </Modal>
  )
}
