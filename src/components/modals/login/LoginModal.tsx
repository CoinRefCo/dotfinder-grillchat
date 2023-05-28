import CaptchaInvisible from '@/components/captcha/CaptchaInvisible'
import Modal, { ModalFunctionalityProps } from '@/components/modals/Modal'
import { useMyAccount } from '@/stores/my-account'
import { isTouchDevice } from '@/utils/device'
import { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import Toast from '../../Toast'
import { loginModalContents, LoginModalStep } from './LoginModalContent'
import { useDisconnect } from 'wagmi'

export type LoginModalProps = ModalFunctionalityProps & {
  afterLogin?: () => void
  beforeLogin?: () => void
  openModal: () => void
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
    withFooter: true
  },
  'enter-secret-key': {
    title: '🔑 Grill secret key',
    desc: 'To access GrillChat, you need a Grill secret key. If you do not have one, just write your first chat message, and you will be given one.',
    withBackButton: true,
    withFooter: true
  },
  'account-created': {
    title: '🎉 Account created',
    desc: 'We have created an anonymous account for you. You can now use grill.chat or connect your traditional Web3 wallet to it. ',
  },
  'evm-address-linked': {
    title: '🎉 EVM Wallet connected',
    desc: `Now you can use all of Grill's EVM features such as ERC20 tokens, NFTs, and more.`,
  },
  'evm-connecting-error': {
    title: '😕 Something went wrong',
    desc: 'This might be related to the transaction signature. You can try again, or come back to it later.',
    withBackButton: false,
    withFooter: false
  }
}

export default function LoginModal({
  afterLogin,
  beforeLogin,
  ...props
}: LoginModalProps) {
  const login = useMyAccount((state) => state.login)
  const [privateKey, setPrivateKey] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [currentStep, setCurrentStep] = useState<LoginModalStep>('login')
  // const { disconnect } = useDisconnect()

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    beforeLogin?.()
    if (await login(privateKey)) {
      afterLogin?.()
      setPrivateKey('')
      props.closeModal()
    } else {
      toast.custom((t) => (
        <Toast
          t={t}
          title='Login Failed'
          description='The Grill secret key you provided is not valid'
        />
      ))
    }
  }

  const onBackClick = () => setCurrentStep('login')

  useEffect(() => {
    if (props.isOpen) setCurrentStep('login')
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
      onBackClick={withBackButton ? onBackClick : undefined}
      closeModal={() => {
        props.closeModal()
        // disconnect()
      }}
    >
      <CaptchaInvisible>
        {(runCaptcha, termsAndService) => {
          return (
            <ModalContent
              onSubmit={onSubmit}
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
