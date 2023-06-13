import ChatPreviewList from '@/components/chats/ChatPreviewList'
import NoChatsFound from '@/components/chats/NoChatsFound'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import useSearch from '@/hooks/useSearch'
import useSortedChats from '../hooks/useSortedChats'
import HubPageNavbar from './HubPageNavbar'

// const WelcomeModal = dynamic(() => import('@/components/modals/WelcomeModal'), {
//   ssr: false,
// })

export type HubPageProps = {
  hubId: string
}
const searchKeys = ['content.title']
export default function HubPage({ hubId }: HubPageProps) {
  // const isInIframe = useIsInIframe()

  const { chats, allChatIds } = useSortedChats(hubId)

  const { search, getSearchResults, setSearch, focusController } = useSearch()
  const { focusedElementIndex, searchResults } = getSearchResults(
    chats,
    searchKeys
  )

  return (
    <DefaultLayout
      navbarProps={{
        customContent: ({
          backButton,
          logoLink,
          authComponent,
          colorModeToggler,
        }) => {
          return (
            <HubPageNavbar
              chatsCount={allChatIds.length}
              auth={authComponent}
              colorModeToggler={colorModeToggler}
              backButton={backButton}
              logo={logoLink}
              hubId={hubId}
              searchProps={{
                search,
                setSearch,
                ...focusController,
              }}
            />
          )
        },
      }}
    >
      {/* {!isInIframe && <WelcomeModal />} */}
      <div className='flex flex-col'>
        {searchResults.length === 0 && (
          <NoChatsFound search={search} hubId={hubId} />
        )}
        <ChatPreviewList
          chats={searchResults}
          focusedElementIndex={focusedElementIndex}
        />
      </div>
    </DefaultLayout>
  )
}
