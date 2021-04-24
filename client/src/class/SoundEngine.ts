/**
 * Sound Engine
 */
export class SoundEngine {
  sound: { [id: string]: HTMLAudioElement } = {};

  /**
   * preload all sounds
   * @param
   */
  preload() {
    this.load(Sound.Item_Chest_Opening_01);
    this.load(Sound.Item_Chest_Close);
    this.load(Sound.Player_Map_Open);
    this.load(Sound.Player_Map_Close);
    this.load(Sound.Ambience_Tavern_WithoutMusic_LOOP, true);
    this.load(Sound.Ambience_Ship_LOOP, true);
    this.load(Sound.Item_Rudder_Movement_01);
    this.load(Sound.Player_HoistSail);
    this.load(Sound.Player_Walking_WoodenLeg_03);
    this.load(Sound.Weapons_CannonsShot_04);
    this.load(Sound.Impact_Ship_03);
    this.load(Sound.Impact_Ship_02);
    this.load(Sound.Impact_Cannon_OnWater_03);
    this.load(Sound.Weapons_CannonsShot_04);
    this.load(Sound.Item_Chest_Landing);
    this.load(Sound.Item_CoinChest_Opening_01);
    this.load(Sound.Player_Ship_Repair_04, true);
    this.load(Sound.Weapons_CannonsShot_02);
  }

  /**
   * Preload a sound
   * @param sound
   */
  load(sound: Sound, loop: boolean = false) {
    this.sound[sound] = new Audio("/sound/" + sound);
    if (loop) {
      this.sound[sound].loop = true;
    }
  }

  /**
   * play a sound
   * @param sound
   * @param volume volume between 0 and 1
   */
  play(sound: Sound, volume: number = 1) {
    if (this.sound[sound]) {
      this.sound[sound].volume = volume;

      if (!this.sound[sound].ended) {
        this.sound[sound].currentTime = 0;
      }

      this.sound[sound].play();
    } else {
      console.log("failed to load" + sound);
    }
  }

  /**
   * stop a sound
   * @param sound
   */
  stop(sound: Sound) {
    this.sound[sound].pause();
  }
}

export enum Sound {
  Ambience_OceanWaves_LOOP = "Ambience_OceanWaves_LOOP.ogg",
  Ambience_Ship_LOOP = "Ambience_Ship_LOOP.ogg",
  Ambience_Tavern_WithMusic_LOOP = "Ambience_Tavern_WithMusic_LOOP.ogg",
  Ambience_Tavern_WithoutMusic_LOOP = "Ambience_Tavern_WithoutMusic_LOOP.ogg",
  Emotions_BattleShout_02 = "Emotions_BattleShout_02.ogg",
  Emotions_BattleShout_03 = "Emotions_BattleShout_03.ogg",
  Emotions_BattleShout_01 = "Emotions_BattleShout_01.ogg",
  Emotions_BattleShout_04 = "Emotions_BattleShout_04.ogg",
  Emotions_BattleShout_05 = "Emotions_BattleShout_05.ogg",
  Emotions_BattleShout_06 = "Emotions_BattleShout_06.ogg",
  Emotions_BattleShout_07 = "Emotions_BattleShout_07.ogg",
  Emotions_BattleShout_08 = "Emotions_BattleShout_08.ogg",
  Emotions_BattleShout_09 = "Emotions_BattleShout_09.ogg",
  Emotions_BattleShout_10 = "Emotions_BattleShout_10.ogg",
  Emotions_BattleShout_11 = "Emotions_BattleShout_11.ogg",
  Emotions_Group_Applause = "Emotions_Group_Applause.ogg",
  Emotions_Group_Aye = "Emotions_Group_Aye.ogg",
  Emotions_Group_Laugh_01 = "Emotions_Group_Laugh_01.ogg",
  Emotions_Group_Laugh_02 = "Emotions_Group_Laugh_02.ogg",
  Emotions_Pirate1_Laugh1 = "Emotions_Pirate1_Laugh1.ogg",
  Emotions_Pirate1_Laugh2 = "Emotions_Pirate1_Laugh2.ogg",
  Emotions_Pirate2_Laugh1 = "Emotions_Pirate2_Laugh1.ogg",
  Emotions_Pirate2_Laugh2 = "Emotions_Pirate2_Laugh2.ogg",
  Emotions_Pirate2_Laugh3 = "Emotions_Pirate2_Laugh3.ogg",
  Impact_Cannon_OnWater_01 = "Impact_Cannon_OnWater_01.ogg",
  Impact_Cannon_OnWater_02 = "Impact_Cannon_OnWater_02.ogg",
  Impact_Cannon_OnWater_03 = "Impact_Cannon_OnWater_03.ogg",
  Impact_Cannons_OnWater_01 = "Impact_Cannons_OnWater_01.ogg",
  Impact_Cannons_OnWater_02 = "Impact_Cannons_OnWater_02.ogg",
  Impact_Cannons_OnWater_03 = "Impact_Cannons_OnWater_03.ogg",
  Impact_Ship_01 = "Impact_Ship_01.ogg",
  Impact_Ship_02 = "Impact_Ship_02.ogg",
  Impact_Ship_03 = "Impact_Ship_03.ogg",
  Item_Bottle_Destroy_01 = "Item_Bottle_Destroy_01.ogg",
  Item_Bottle_Destroy_02 = "Item_Bottle_Destroy_02.ogg",
  Item_Bottle_Open_01 = "Item_Bottle_Open_01.ogg",
  Item_Bottle_Open_02 = "Item_Bottle_Open_02.ogg",
  Item_Chest_Close = "Item_Chest_Close.ogg",
  Item_Chest_Landing = "Item_Chest_Landing.ogg",
  Item_Chest_Moving_LOOP = "Item_Chest_Moving_LOOP.ogg",
  Item_Chest_Opening_01 = "Item_Chest_Opening_01.ogg",
  Item_Chest_Opening_02 = "Item_Chest_Opening_02.ogg",
  Item_CoinChest_Opening_01 = "Item_CoinChest_Opening_01.ogg",
  Item_CoinChest_Opening_02 = "Item_CoinChest_Opening_02.ogg",
  Item_GemsChest_Opening = "Item_GemsChest_Opening.ogg",
  Item_Glass_Fill_01 = "Item_Glass_Fill_01.ogg",
  Item_Glass_Fill_01_WithoutBottleSound = "Item_Glass_Fill_01_WithoutBottleSound.ogg",
  Item_Glass_Fill_02 = "Item_Glass_Fill_02.ogg",
  Item_Glass_Fill_02_WithoutBottleSound = "Item_Glass_Fill_02_WithoutBottleSound.ogg",
  Item_MagicChest_Opening_01 = "Item_MagicChest_Opening_01.ogg",
  Item_MagicChest_Opening_02 = "Item_MagicChest_Opening_02.ogg",
  Item_Rudder_Movement_01 = "Item_Rudder_Movement_01.ogg",
  Item_Rudder_Movement_02 = "Item_Rudder_Movement_02.ogg",
  Item_Rudder_Movement_03 = "Item_Rudder_Movement_03.ogg",
  Item_Rudder_Movement_04 = "Item_Rudder_Movement_04.ogg",
  Music_PirateWin = "Music_PirateWin.ogg",
  Music_PirateWin_WithPirateVoices = "Music_PirateWin_WithPirateVoices.ogg",
  Music_Tavern_LOOP = "Music_Tavern_LOOP.ogg",
  Player_Dig_01 = "Player_Dig_01.ogg",
  Player_Dig_02 = "Player_Dig_02.ogg",
  Player_Dig_03 = "Player_Dig_03.ogg",
  Player_DrinkingFast = "Player_DrinkingFast.ogg",
  Player_Drinking = "Player_Drinking.ogg",
  Player_DrinkingSingleGulp = "Player_DrinkingSingleGulp.ogg",
  Player_Eating_01_LOOP = "Player_Eating_01_LOOP.ogg",
  Player_Eating_01 = "Player_Eating_01.ogg",
  Player_Eating_02_LOOP = "Player_Eating_02_LOOP.ogg",
  Player_Eating_02 = "Player_Eating_02.ogg",
  Player_EatingApple_01 = "Player_EatingApple_01.ogg",
  Player_EatingApple_02 = "Player_EatingApple_02.ogg",
  Player_EatingApple_03 = "Player_EatingApple_03.ogg",
  Player_HoistSail = "Player_HoistSail.ogg",
  Player_Map_Close = "Player_Map_Close.ogg",
  Player_Map_Manipulate_01 = "Player_Map_Manipulate_01.ogg",
  Player_Map_Manipulate_02 = "Player_Map_Manipulate_02.ogg",
  Player_Map_Open = "Player_Map_Open.ogg",
  Player_Map_Writing_01 = "Player_Map_Writing_01.ogg",
  Player_Map_Writing_02 = "Player_Map_Writing_02.ogg",
  Player_Map_Writing_03 = "Player_Map_Writing_03.ogg",
  Player_Map_Writing_04 = "Player_Map_Writing_04.ogg",
  Player_Ship_Repair_01 = "Player_Ship_Repair_01.ogg",
  Player_Ship_Repair_02 = "Player_Ship_Repair_02.ogg",
  Player_Ship_Repair_03 = "Player_Ship_Repair_03.ogg",
  Player_Ship_Repair_04 = "Player_Ship_Repair_04.ogg",
  Player_Underwater = "Player_Underwater.ogg",
  Player_WalkingOnShip_01 = "Player_WalkingOnShip_01.ogg",
  Player_WalkingOnShip_02 = "Player_WalkingOnShip_02.ogg",
  Player_WalkingOnShip_03 = "Player_WalkingOnShip_03.ogg",
  Player_WalkingOnShip_04 = "Player_WalkingOnShip_04.ogg",
  Player_WalkingOnShip_05 = "Player_WalkingOnShip_05.ogg",
  Player_WalkingOnShip_06 = "Player_WalkingOnShip_06.ogg",
  Player_Walking_WoodenLeg_01 = "Player_Walking_WoodenLeg_01.ogg",
  Player_Walking_WoodenLeg_02 = "Player_Walking_WoodenLeg_02.ogg",
  Player_Walking_WoodenLeg_03 = "Player_Walking_WoodenLeg_03.ogg",
  Player_Walking_WoodenLeg_04 = "Player_Walking_WoodenLeg_04.ogg",
  Weapons_Cannon_Recharge = "Weapons_Cannon_Recharge.ogg",
  Weapons_CannonsShot_01 = "Weapons_CannonsShot_01.ogg",
  Weapons_CannonsShot_02 = "Weapons_CannonsShot_02.ogg",
  Weapons_CannonsShot_03 = "Weapons_CannonsShot_03.ogg",
  Weapons_CannonsShot_04 = "Weapons_CannonsShot_04.ogg",
  Weapons_Shotgun_Fire_01 = "Weapons_Shotgun_Fire_01.ogg",
  Weapons_Shotgun_Fire_02 = "Weapons_Shotgun_Fire_02.ogg",
  Weapons_Shotgun_Fire_03 = "Weapons_Shotgun_Fire_03.ogg",
  Weapons_Shotgun_Fire_04 = "Weapons_Shotgun_Fire_04.ogg",
  Weapons_Shotgun_Recharge = "Weapons_Shotgun_Recharge.ogg",
  Weapons_SwordHits_Type1_01 = "Weapons_SwordHits_Type1_01.ogg",
  Weapons_SwordHits_Type1_02 = "Weapons_SwordHits_Type1_02.ogg",
  Weapons_SwordHits_Type2_01 = "Weapons_SwordHits_Type2_01.ogg",
  Weapons_SwordHits_Type2_02 = "Weapons_SwordHits_Type2_02.ogg",
  Weapons_SwordHits_Type2_03 = "Weapons_SwordHits_Type2_03.ogg",
  Weapons_SwordHits_Type2_04 = "Weapons_SwordHits_Type2_04.ogg",
  Weapons_SwordHits_Type2_05 = "Weapons_SwordHits_Type2_05.ogg",
  Weapons_SwordHits_Type2_06 = "Weapons_SwordHits_Type2_06.ogg",
  Weapons_SwordHits_Type3_01 = "Weapons_SwordHits_Type3_01.ogg",
  Weapons_SwordHits_Type3_02 = "Weapons_SwordHits_Type3_02.ogg",
  Weapons_SwordHits_Type3_03 = "Weapons_SwordHits_Type3_03.ogg",
  Weapons_SwordHits_Type3_04 = "Weapons_SwordHits_Type3_04.ogg",
  Weapons_SwordHits_Type4_01 = "Weapons_SwordHits_Type4_01.ogg",
  Weapons_SwordHits_Type4_02 = "Weapons_SwordHits_Type4_02.ogg",
  Weapons_SwordHits_Type4_03 = "Weapons_SwordHits_Type4_03.ogg",
  Weapons_SwordWhoosh_Type1_01 = "Weapons_SwordWhoosh_Type1_01.ogg",
  Weapons_SwordWhoosh_Type1_02 = "Weapons_SwordWhoosh_Type1_02.ogg",
  Weapons_SwordWhoosh_Type1_03 = "Weapons_SwordWhoosh_Type1_03.ogg",
  Weapons_SwordWhoosh_Type1_04 = "Weapons_SwordWhoosh_Type1_04.ogg",
  Weapons_SwordWhoosh_Type2_01 = "Weapons_SwordWhoosh_Type2_01.ogg",
  Weapons_SwordWhoosh_Type2_02 = "Weapons_SwordWhoosh_Type2_02.ogg",
  Weapons_SwordWhoosh_Type2_03 = "Weapons_SwordWhoosh_Type2_03.ogg",
  Weapons_SwordWhoosh_Type2_04 = "Weapons_SwordWhoosh_Type2_04.ogg",
  Weapons_SwordWhoosh_Type2_05 = "Weapons_SwordWhoosh_Type2_05.ogg",
  Weapons_SwordWounds_01 = "Weapons_SwordWounds_01.ogg",
  Weapons_SwordWounds_02 = "Weapons_SwordWounds_02.ogg",
  Weapons_SwordWounds_03 = "Weapons_SwordWounds_03.ogg",
  Weapons_SwordWounds_04 = "Weapons_SwordWounds_04.ogg",
  Weapons_SwordWounds_05 = "Weapons_SwordWounds_05.ogg",
  Weapons_UnfoldSword_01 = "Weapons_UnfoldSword_01.ogg",
  Weapons_UnfoldSword_02 = "Weapons_UnfoldSword_02.ogg",
}
