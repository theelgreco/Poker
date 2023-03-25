const deck = [
  {
    card: "A",
    suit: "hearts",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/5/57/Playing_card_heart_A.svg")',
  },
  {
    card: "A",
    suit: "diamonds",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/d/d3/Playing_card_diamond_A.svg")',
  },
  {
    card: "A",
    suit: "clubs",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/3/36/Playing_card_club_A.svg")',
  },
  {
    card: "A",
    suit: "spades",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/2/25/Playing_card_spade_A.svg")',
  },
  {
    card: "2",
    suit: "hearts",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/d/d5/Playing_card_heart_2.svg")',
  },
  {
    card: "2",
    suit: "diamonds",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/5/59/Playing_card_diamond_2.svg")',
  },
  {
    card: "2",
    suit: "clubs",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/f/f5/Playing_card_club_2.svg")',
  },
  {
    card: "2",
    suit: "spades",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/f/f2/Playing_card_spade_2.svg")',
  },
  {
    card: "3",
    suit: "hearts",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/b/b6/Playing_card_heart_3.svg")',
  },
  {
    card: "3",
    suit: "diamonds",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/8/82/Playing_card_diamond_3.svg")',
  },
  {
    card: "3",
    suit: "clubs",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/6/6b/Playing_card_club_3.svg")',
  },
  {
    card: "3",
    suit: "spades",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/5/52/Playing_card_spade_3.svg")',
  },
  {
    card: "4",
    suit: "hearts",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/a/a2/Playing_card_heart_4.svg")',
  },
  {
    card: "4",
    suit: "diamonds",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/2/20/Playing_card_diamond_4.svg")',
  },
  {
    card: "4",
    suit: "clubs",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/3/3d/Playing_card_club_4.svg")',
  },
  {
    card: "4",
    suit: "spades",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/2/2c/Playing_card_spade_4.svg")',
  },
  {
    card: "5",
    suit: "hearts",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/5/52/Playing_card_heart_5.svg")',
  },
  {
    card: "5",
    suit: "diamonds",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/f/fd/Playing_card_diamond_5.svg")',
  },
  {
    card: "5",
    suit: "clubs",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/5/50/Playing_card_club_5.svg")',
  },
  {
    card: "5",
    suit: "spades",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/9/94/Playing_card_spade_5.svg")',
  },
  {
    card: "6",
    suit: "hearts",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/c/cd/Playing_card_heart_6.svg")',
  },
  {
    card: "6",
    suit: "diamonds",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/8/80/Playing_card_diamond_6.svg")',
  },
  {
    card: "6",
    suit: "clubs",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/a/a0/Playing_card_club_6.svg")',
  },
  {
    card: "6",
    suit: "spades",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/d/d2/Playing_card_spade_6.svg")',
  },
  {
    card: "7",
    suit: "hearts",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/9/94/Playing_card_heart_7.svg")',
  },
  {
    card: "7",
    suit: "diamonds",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/e/e6/Playing_card_diamond_7.svg")',
  },
  {
    card: "7",
    suit: "clubs",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/4/4b/Playing_card_club_7.svg")',
  },
  {
    card: "7",
    suit: "spades",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/6/66/Playing_card_spade_7.svg")',
  },
  {
    card: "8",
    suit: "hearts",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/5/50/Playing_card_heart_8.svg")',
  },
  {
    card: "8",
    suit: "diamonds",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/7/78/Playing_card_diamond_8.svg")',
  },
  {
    card: "8",
    suit: "clubs",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/e/eb/Playing_card_club_8.svg")',
  },
  {
    card: "8",
    suit: "spades",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/2/21/Playing_card_spade_8.svg")',
  },
  {
    card: "9",
    suit: "hearts",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/5/50/Playing_card_heart_9.svg")',
  },
  {
    card: "9",
    suit: "diamonds",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/9/9e/Playing_card_diamond_9.svg")',
  },
  {
    card: "9",
    suit: "clubs",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/2/27/Playing_card_club_9.svg")',
  },
  {
    card: "9",
    suit: "spades",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/e/e0/Playing_card_spade_9.svg")',
  },
  {
    card: "10",
    suit: "hearts",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/9/98/Playing_card_heart_10.svg")',
  },
  {
    card: "10",
    suit: "diamonds",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/3/34/Playing_card_diamond_10.svg")',
  },
  {
    card: "10",
    suit: "clubs",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/3/3e/Playing_card_club_10.svg")',
  },
  {
    card: "10",
    suit: "spades",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/8/87/Playing_card_spade_10.svg")',
  },
  {
    card: "J",
    suit: "hearts",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/4/46/Playing_card_heart_J.svg")',
  },
  {
    card: "J",
    suit: "diamonds",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/a/af/Playing_card_diamond_J.svg")',
  },
  {
    card: "J",
    suit: "clubs",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/b/b7/Playing_card_club_J.svg")',
  },
  {
    card: "J",
    suit: "spades",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/b/bd/Playing_card_spade_J.svg")',
  },
  {
    card: "Q",
    suit: "hearts",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/7/72/Playing_card_heart_Q.svg")',
  },
  {
    card: "Q",
    suit: "diamonds",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/0/0b/Playing_card_diamond_Q.svg")',
  },
  {
    card: "Q",
    suit: "clubs",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/f/f2/Playing_card_club_Q.svg")',
  },
  {
    card: "Q",
    suit: "spades",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/5/51/Playing_card_spade_Q.svg")',
  },
  {
    card: "K",
    suit: "hearts",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/d/dc/Playing_card_heart_K.svg")',
  },
  {
    card: "K",
    suit: "diamonds",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/7/78/Playing_card_diamond_K.svg")',
  },
  {
    card: "K",
    suit: "clubs",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/2/22/Playing_card_club_K.svg")',
  },
  {
    card: "K",
    suit: "spades",
    img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/9/9f/Playing_card_spade_K.svg")',
  },
];

module.exports = deck;
