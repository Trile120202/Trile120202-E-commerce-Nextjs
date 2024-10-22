import Carousel from '../../components/Carousel';
import CategoryHome from '@/components/home/CategoryHome';
import SectionProductHome from "@/components/home/SectionProductHome";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow container mx-auto px-4 py-8">
                <Carousel
                    images={['https://picsum.photos/1920/600?random=2', 'https://picsum.photos/1920/600?random=1', 'https://picsum.photos/1920/600?random=3', 'https://picsum.photos/1920/600?random=4', 'https://picsum.photos/1920/600?random=5', 'https://picsum.photos/1920/600?random=6', 'https://picsum.photos/1920/600?random=7', 'https://picsum.photos/1920/600?random=8']}/>
                <CategoryHome />
                <SectionProductHome/>
            </main>
        </div>
    );
}
