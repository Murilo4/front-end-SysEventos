import {Swiper, SwiperProps} from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';



interface SliderProps{
    settings: SwiperProps
    children: React.ReactNode
}
export default function Slider({settings, children}: SliderProps){
    return <Swiper modules={[Navigation, Pagination, Autoplay]}{...settings}>{children}</Swiper>
}