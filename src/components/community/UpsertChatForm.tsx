import AutofocusWrapper from '@/components/AutofocusWrapper'
import FormButton from '@/components/FormButton'
import ImageInput from '@/components/inputs/ImageInput'
import Input from '@/components/inputs/Input'
import TextArea from '@/components/inputs/TextArea'
import {
  JoinChatWrapper,
  UpsertPostWrapper,
} from '@/services/subsocial/posts/mutation'
import { useSendEvent } from '@/stores/analytics'
import { cx } from '@/utils/class-names'
import { getChatPageLink } from '@/utils/links'
import { zodResolver } from '@hookform/resolvers/zod'
import { PostData } from '@subsocial/api/types'
import { useRouter } from 'next/router'
import { ComponentProps, useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import urlJoin from 'url-join'
import { z } from 'zod'

type InsertAdditionalProps = {
  hubId: string
}
type UpdateAdditionalProps = {
  chat: PostData
}
export type UpsertChatFormProps = ComponentProps<'form'> &
  (InsertAdditionalProps | UpdateAdditionalProps) & {
    onSuccess?: () => void
    onTxSuccess?: () => void
  }

const formSchema = z.object({
  image: z.string(),
  title: z.string().nonempty('Name cannot be empty'),
  body: z.string(),
})
type FormSchema = z.infer<typeof formSchema>

export default function UpsertChatForm(props: UpsertChatFormProps) {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const sendEvent = useSendEvent()

  const router = useRouter()
  const { chat, hubId, onSuccess, onTxSuccess, ...otherProps } =
    props as UpsertChatFormProps &
      Partial<InsertAdditionalProps & UpdateAdditionalProps>

  const defaultValues = {
    image: chat?.content?.image ?? '',
    body: chat?.content?.body ?? '',
    title: chat?.content?.title ?? '',
  }
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormSchema>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const isUpdating = !!chat
  const actionText = isUpdating ? 'Save changes' : 'Create'

  return (
    <JoinChatWrapper>
      {({ mutateAsync }) => (
        <UpsertPostWrapper
          config={{
            txCallbacks: {
              onSuccess: async (_data, _, txResult) => {
                if (isUpdating) return

                const { getNewIdsFromEvent } = await import(
                  '@subsocial/api/utils'
                )
                const [newId] = getNewIdsFromEvent(txResult)
                const newIdString = newId.toString()

                mutateAsync({ chatId: newIdString })

                setIsRedirecting(true)
                await router.push(
                  urlJoin(
                    getChatPageLink({ query: {} }, newIdString, hubId),
                    '?new=true'
                  )
                )
                setIsRedirecting(false)

                onTxSuccess?.()
              },
            },
          }}
          loadingUntilTxSuccess
        >
          {({ isLoading: isMutating, mutateAsync }) => {
            const onSubmit: SubmitHandler<FormSchema> = async (data) => {
              if (isUpdating) sendEvent('click edit_chat_button')
              else sendEvent('click create_chat_button')

              await mutateAsync({
                spaceId: hubId,
                postId: chat?.id,
                ...data,
              })
              onSuccess?.()
            }

            const isLoading = isMutating || isRedirecting

            return (
              <form
                {...otherProps}
                onSubmit={handleSubmit(onSubmit)}
                className={cx('flex flex-col gap-4', otherProps.className)}
              >
                <div className='flex flex-col items-center gap-4'>
                  <Controller
                    control={control}
                    name='image'
                    render={({ field, fieldState }) => {
                      return (
                        <ImageInput
                          disabled={isLoading}
                          image={field.value}
                          setImageUrl={(value) => setValue('image', value)}
                          containerProps={{ className: 'my-2' }}
                          error={fieldState.error?.message}
                        />
                      )
                    }}
                  />
                  <AutofocusWrapper>
                    {({ ref }) => (
                      <Input
                        {...register('title')}
                        ref={(e) => {
                          register('title').ref(e)
                          ref.current = e
                        }}
                        disabled={isLoading}
                        placeholder='Chat Name'
                        error={errors.title?.message}
                        variant='fill-bg'
                      />
                    )}
                  </AutofocusWrapper>
                  <TextArea
                    {...register('body')}
                    disabled={isLoading}
                    placeholder='Description (optional)'
                    error={errors.body?.message}
                    rows={1}
                    variant='fill-bg'
                  />
                </div>

                <FormButton
                  schema={formSchema}
                  watch={watch}
                  isLoading={isLoading}
                  loadingText={isUpdating ? 'Saving...' : 'Creating...'}
                  size='lg'
                >
                  {actionText}
                </FormButton>
              </form>
            )
          }}
        </UpsertPostWrapper>
      )}
    </JoinChatWrapper>
  )
}
