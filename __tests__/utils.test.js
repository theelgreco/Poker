const { formatHands, fetchWinningHand } = require("../utils.js");

describe("winningHand", () => {
  test("test", () => {
    const table = {
      seats: [
        {
          seatOne: {
            clientId: "fTjrQ50XDQvzVQ7vAAAC",
            stack: 4975,
            playing: true,
            cards: [
              {
                card: "2",
                suit: "clubs",
                img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/3/3d/Playing_card_club_4.svg")',
              },
              {
                card: "2",
                suit: "spades",
                img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/2/21/Playing_card_spade_8.svg")',
              },
            ],
            stake: 25,
          },
        },
        {
          seatTwo: {
            clientId: "fTjrQ50XDQvzVQ7vAAAC",
            stack: 4975,
            playing: true,
            cards: [
              {
                card: "4",
                suit: "clubs",
                img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/3/3d/Playing_card_club_4.svg")',
              },
              {
                card: "8",
                suit: "spades",
                img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/2/21/Playing_card_spade_8.svg")',
              },
            ],
            stake: 25,
          },
        },
        {
          seatThree: {
            clientId: "bzG33_tKUYLs976EAAAA",
            stack: 4950,
            playing: true,
            cards: [
              {
                card: "A",
                suit: "hearts",
                img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/5/57/Playing_card_heart_A.svg")',
              },
              {
                card: "7",
                suit: "hearts",
                img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/9/94/Playing_card_heart_7.svg")',
              },
            ],
            stake: 50,
          },
        },
      ],
      communityCards: [
        [
          {
            card: "Q",
            suit: "spades",
            img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/5/51/Playing_card_spade_Q.svg")',
          },
          {
            card: "A",
            suit: "clubs",
            img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/3/36/Playing_card_club_A.svg")',
          },
          {
            card: "A",
            suit: "diamonds",
            img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/d/d3/Playing_card_diamond_A.svg")',
          },
        ],
        [
          {
            card: "3",
            suit: "hearts",
            img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/b/b6/Playing_card_heart_3.svg")',
          },
        ],
        [
          {
            card: "3",
            suit: "spades",
            img: 'center no-repeat url("https://upload.wikimedia.org/wikipedia/commons/f/f2/Playing_card_spade_2.svg")',
          },
        ],
      ],
    };
    const hands = formatHands(table);
    fetchWinningHand(hands).then((res) => {
      console.log(res);
    });
  });
});
