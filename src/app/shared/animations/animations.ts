import { trigger, group, style, animate, transition, query, animateChild,  } from '@angular/animations';

export const slideInAnimation =
trigger('routeAnimations', [
  transition('* => mi-perfil', [
    style({ opacity: 0 }),
    animate('800ms ease-in', style({ opacity: 1 }))
  ]),
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ left: '-100%' })
    ], { optional: true }),
    query(':leave', animateChild(), { optional: true }),
    group([
      query(':leave', [
        animate('200ms ease-out', style({ left: '100%', opacity: 0 }))
      ], { optional: true }),
      query(':enter', [
        animate('300ms ease-out', style({ left: '0%' }))
      ], { optional: true }),
      query('@*', animateChild(), { optional: true })
    ]),
  ])
]);