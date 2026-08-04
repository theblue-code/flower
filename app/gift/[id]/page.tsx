import GiftClient from './GiftClient'

export default function Page({ params }: { params: { id: string } }) {
    return <GiftClient id={params.id} />
}
