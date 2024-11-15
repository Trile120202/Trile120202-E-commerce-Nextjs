import Carousel from '../../components/Carousel';
import CategoryHome from '@/components/home/CategoryHome';
import SectionProductHome from "@/components/home/SectionProductHome";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow container mx-auto px-4 py-8">
                <Carousel location="home" position="1" />
                <CategoryHome />
                <SectionProductHome/>
            </main>
        </div>
    );
}
