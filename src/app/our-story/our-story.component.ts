import { Component } from '@angular/core';

interface SourcingLocation {
  place: string;
  ingredient: string;
  desc: string;
}

interface EcoPledge {
  title: string;
  desc: string;
  icon: 'heart' | 'sparkles' | 'shield';
}

@Component({
  selector: 'app-our-story',
  templateUrl: './our-story.component.html',
  styleUrls: ['./our-story.component.css']
})
export class OurStoryComponent {
  heroImage = 'https://placehold.co/700x700/eef3ea/2f4f3f?text=Shriza+Naturals';

  sourcingLocations: SourcingLocation[] = [
    { place: 'Kannauj, UP', ingredient: 'Fresh Damask Roses', desc: 'Steam-distilled at sunrise to capture active hydrosols.' },
    { place: 'Pampore, Kashmir', ingredient: 'Grade A Saffron', desc: 'Grown at high altitudes, dried in shade to retain intense red coloring.' },
    { place: 'Spiti Valley, Himalayas', ingredient: 'Mineral Shilajit Resin', desc: 'Purified under sun filtration for 40 days to retain fulvic acid.' },
    { place: 'Gir, Gujarat', ingredient: 'A2 Desi Gir Cow Ghee', desc: 'Churned using bilona method from curd butter.' }
  ];

  ecoPledges: EcoPledge[] = [
    {
      title: 'Zero Waste',
      desc: 'All production leftovers at our facilities are composted and returned to farm soils as natural fertilizers.',
      icon: 'heart'
    },
    {
      title: 'Glass Only',
      desc: 'We strictly package in heavy amber pharmaceutical-grade glass jars. Completely inert, recyclable, and elegant.',
      icon: 'sparkles'
    },
    {
      title: 'Cruelty Free',
      desc: 'Our skin care and beauty range is 100% vegan and dermatologically tested on volunteers, never on animals.',
      icon: 'shield'
    }
  ];
}
