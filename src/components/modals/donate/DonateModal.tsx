import Poligon from '@/assets/graphics/poligon.png'
import USDC from '@/assets/graphics/usdc.png'
import Button from '@/components/Button'
import CommonExtensionModal from '@/components/extensions/CommonExtensionModal'
import Input from '@/components/inputs/Input'
import Dropdown, { ListItem } from '@/components/inputs/SelectInput'
import ProfilePreview from '@/components/ProfilePreview'
import useGetTheme from '@/hooks/useGetTheme'
import { getAccountDataQuery } from '@/services/subsocial/evmAddresses'
import { cx } from '@/utils/class-names'
import { formatUnits } from 'ethers'
import { ChangeEventHandler, useState } from 'react'
import { ModalFunctionalityProps } from '../Modal'
import { useGetBalance, useTransfer } from './api/transfer'

const chainItems = [
  {
    id: 'Poligon',
    icon: Poligon,
    label: 'Poligon',
  },
  {
    id: 'Poligon',
    icon: Poligon,
    label: 'Poligon1',
  },
  {
    id: 'Poligon',
    icon: Poligon,
    label: 'Poligon2',
  },
]

const tokensItems = [
  {
    id: 'matic',
    icon: USDC,
    label: 'MATIC',
  },
  {
    id: 'usdc',
    icon: USDC,
    label: 'USDC',
  },
  {
    id: 'eth',
    icon: USDC,
    label: 'ETH',
  },
]

type AmountInputProps = {
  setAmount: (amount: string) => void
  amount: string
  token: string
  tokenSymbol: string
}

const AmountInput = ({
  amount,
  setAmount,
  token,
  tokenSymbol,
}: AmountInputProps) => {
  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setAmount(e.target.value)
  }

  const { balance, decimals } = useGetBalance(token)

  return (
    <div>
      <div className='mb-2 flex justify-between text-sm font-normal leading-4 text-gray-400'>
        <div>Amount</div>
        <div>
          Balance:{' '}
          <span className='font-bold text-white'>
            {decimals && balance
              ? formatUnits(balance, decimals).slice(0, 6)
              : 0}{' '}
            {tokenSymbol}
          </span>
        </div>
      </div>
      <Input
        step={0.1}
        min={0}
        value={amount}
        onChange={onInputChange}
        rightElement={() => (
          <div>
            <Button
              variant='transparent'
              className={cx(
                'absolute bottom-0 right-4 top-0 my-auto p-1 text-indigo-400',
                'hover:text-indigo-500 hover:ring-0'
              )}
            >
              Max
            </Button>
          </div>
        )}
        type='number'
        className={cx(
          'h-[54px] bg-slate-900 pr-16 text-base leading-6 ring-1 ring-inset ring-gray-500',
          'focus:outline-none focus:ring-1 focus:ring-gray-400',
          'hover:outline-none hover:ring-1 hover:ring-gray-400',
          'focus-visible:!ring-1 focus-visible:ring-gray-400'
        )}
      />
    </div>
  )
}

type DonateModalProps = ModalFunctionalityProps & {
  recipient: string
}

export default function DonateModal({ recipient, ...props }: DonateModalProps) {
  const theme = useGetTheme()
  const isDarkTheme = theme === 'dark'
  const [selectedChain, setSelectedChain] = useState<ListItem>(chainItems[0])
  const [selectedToken, setSelectedToken] = useState<ListItem>(tokensItems[0])
  const [amount, setAmount] = useState<string>('0')

  const { data } = getAccountDataQuery.useQuery(recipient)

  const { evmAddress: evmRecipientAddress } = data || {}

  const { sendTransferTx } = useTransfer(selectedToken.id)

  const onButtonClick = async () => {
    if (!evmRecipientAddress || !amount) return

    await sendTransferTx(evmRecipientAddress, amount.replace(',', '.'))
  }

  return (
    <CommonExtensionModal
      {...props}
      formProps={{
        chatId: '3056',
        sendButtonProps: {
          disabled: false,
        },
        sendButtonText: 'Send',
      }}
      title='💰 Donate'
      withCloseButton
      {...props}
    >
      <div>
        <div
          className={cx(
            'mb-6 mt-2 rounded-2xl p-4',
            isDarkTheme ? 'bg-slate-700' : 'bg-slate-200'
          )}
        >
          <ProfilePreview
            address={recipient}
            avatarClassName='h-12 w-12'
            withGrillAddress={false}
            evmAddress={evmRecipientAddress}
          />
        </div>
        <div className='flex flex-col gap-6'>
          <Dropdown
            selected={selectedChain}
            setSelected={setSelectedChain}
            fieldLabel='Chain'
            items={chainItems}
          />
          <Dropdown
            selected={selectedToken}
            setSelected={setSelectedToken}
            fieldLabel='Token'
            items={tokensItems}
          />
          <AmountInput
            amount={amount}
            setAmount={setAmount}
            token={selectedToken.id}
            tokenSymbol={selectedToken.label}
          />
        </div>
      </div>
    </CommonExtensionModal>
  )
}
