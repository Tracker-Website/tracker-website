import Image from "next/image";
import styles from "./page.module.css";
import { promises as fs } from "fs";
import { MatchInfo } from "./page";
import { PlayerParams } from "./page";

interface runeInfo {
  id: number;
}

async function getRuneInfo() {
  const file = await fs.readFile(
    process.cwd() +
      "/app/dragontail-14.10.1/14.10.1/data/en_US/runesReforged.json",
    "utf8"
  );

  return JSON.parse(file);
}

async function getPrimaryInfo(runeId: number | undefined) {
  const runeData = await getRuneInfo();

  for (const runeTree of runeData) {
    for (const slot of runeTree.slots) {
      const primaryRune = slot.runes.find(
        (primaryRune: runeInfo) => primaryRune.id === runeId
      );

      if (primaryRune) {
        return primaryRune.icon;
      }
    }
  }
}

async function getSecondaryInfo(runeId: number | undefined) {
  const runeData = await getRuneInfo();

  for (const rune of runeData) {
    if (rune.id === runeId) {
      return rune.icon;
    }
  }
}

function getRune(rune: string) {
  const riotURL = `https://ddragon.leagueoflegends.com/cdn/img/${rune}`;

  return rune !== undefined ? riotURL : "/images/empty.png";
}

export async function MatchSumRunes({
  match,
  params,
}: {
  match: MatchInfo;
  params: PlayerParams;
}) {
  let champRune1 = null;
  let champRune2 = null;

  const getRunePrimary = () => {
    for (const player of match.info.participants) {
      if (player.riotIdGameName === params.username) {
        return player.perks.styles[0].selections[0].perk;
      }
    }
  };

  const getRuneSecondary = () => {
    for (const player of match.info.participants) {
      if (player.riotIdGameName === params.username) {
        return player.perks.styles[1].style;
      }
    }
  };

  const ChampRune1Id = getRunePrimary();
  const ChampRune2Id = getRuneSecondary();

  const [runeInfo1, runeInfo2] = await Promise.all([
    getPrimaryInfo(ChampRune1Id),
    getSecondaryInfo(ChampRune2Id),
  ]);

  const participant = match.info.participants.find(
    (player) => player.riotIdGameName === params.username
  );

  if (participant) {
    champRune1 = getRune(runeInfo1);
    champRune2 = getRune(runeInfo2);
  }

  return (
    <>
      <div className={styles["rune-container1"]}>
        <Image
          src={champRune1 || "/images/empty.png"}
          fill
          sizes="50px"
          alt="spell1"
          style={{ borderRadius: "5px" }}
        />
      </div>
      <div className={styles["rune-container2"]}>
        <Image
          src={champRune2 || "/images/empty.png"}
          width={25}
          height={25}
          sizes="50px"
          alt="rune2"
          style={{ borderRadius: "5px" }}
        />
      </div>
    </>
  );
}
