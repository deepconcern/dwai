/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation CreateCampaign($input: CampaignInput!) {\n    campaigns {\n      create(input: $input) {\n        id\n      }\n    }\n  }\n": typeof types.CreateCampaignDocument,
    "\n  mutation UpdateCampaign($id: ID!, $input: CampaignInput!) {\n    campaigns {\n      update(id: $id, input: $input) {\n        description\n        id\n        name\n      }\n    }\n  }\n": typeof types.UpdateCampaignDocument,
    "\n  mutation DeleteCampaign($id: ID!) {\n    campaigns {\n      delete(id: $id)\n    }\n  }\n": typeof types.DeleteCampaignDocument,
    "\n  mutation MarkXpForMiss($id: ID!) {\n    characters {\n      adjustXp(delta: 1, id: $id) {\n        id\n        xp\n      }\n    }\n  }\n": typeof types.MarkXpForMissDocument,
    "\n  query GetCampaignMessages($before: ID, $id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        id\n        messages(before: $before) {\n          hasMore\n          messages {\n            id\n            ...MessageFragment\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetCampaignMessagesDocument,
    "\n  subscription CampaignMessages($campaignId: ID!) {\n    campaignMessages(campaignId: $campaignId) {\n      id\n      ...MessageFragment\n    }\n  }\n": typeof types.CampaignMessagesDocument,
    "\n  mutation PostMessage($id: ID!, $input: MessageInput!) {\n    campaigns {\n      postMessage(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n": typeof types.PostMessageDocument,
    "\n  mutation SetDangerRevealed($dangerId: ID!, $revealed: Boolean!) {\n    campaigns {\n      setDangerRevealed(dangerId: $dangerId, revealed: $revealed) {\n        ...DangerFragment\n      }\n    }\n  }\n": typeof types.SetDangerRevealedDocument,
    "\n  mutation SetPortentDone($done: Boolean!, $portentId: ID!) {\n    campaigns {\n      setPortentDone(done: $done, portentId: $portentId) {\n        ...DangerFragment\n      }\n    }\n  }\n": typeof types.SetPortentDoneDocument,
    "\n  mutation SetPortentRevealed($portentId: ID!, $revealed: Boolean!) {\n    campaigns {\n      setPortentRevealed(portentId: $portentId, revealed: $revealed) {\n        ...DangerFragment\n      }\n    }\n  }\n": typeof types.SetPortentRevealedDocument,
    "\n  mutation EndSession($id: ID!, $input: EndSessionInput!) {\n    campaigns {\n      endSession(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n": typeof types.EndSessionDocument,
    "\n  query GetCampaignDangers($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        dangersWithoutFront {\n          ...DangerFragment\n        }\n        fronts {\n          dangers {\n            ...DangerFragment\n          }\n          id\n          name\n          resolved\n        }\n        id\n      }\n    }\n  }\n": typeof types.GetCampaignDangersDocument,
    "\n  query GetCampaign($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        characters {\n          alignmentType\n          bondCount\n          characterClass {\n            name\n          }\n          hitPoints\n          id\n          looks {\n            id\n            value\n          }\n          maxHitPoints\n          name\n          owner {\n            displayName\n          }\n          raceMove {\n            name\n          }\n        }\n        description\n        gm {\n          displayName\n        }\n        id\n        inviteCode\n        isGm\n        myCharacter {\n          id\n          ...CampaignCharacterFragment\n          ...CharacterFragment\n        }\n        name\n        sessions {\n          createdAt\n          id\n          learned {\n            checked\n            reason\n          }\n          looted {\n            checked\n            reason\n          }\n          number\n          overcame {\n            checked\n            reason\n          }\n          reports {\n            alignment {\n              checked\n              reason\n            }\n            bond {\n              checked\n              reason\n            }\n            character {\n              id\n              name\n            }\n            resolvedBondText\n            xpAwarded\n          }\n        }\n      }\n    }\n    moves {\n      basicMoves: byType(type: \"basic\") {\n        ...MoveFragment\n      }\n      specialMoves: byType(type: \"special\") {\n        ...MoveFragment\n      }\n    }\n  }\n": typeof types.GetCampaignDocument,
    "\n  mutation RegenerateInviteCode($id: ID!) {\n    campaigns {\n      regenerateInviteCode(id: $id) {\n        id\n        inviteCode\n      }\n    }\n  }\n": typeof types.RegenerateInviteCodeDocument,
    "\n  query GetKnownThreats($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        id\n        knownThreats {\n          dangerId\n          name\n          portents\n          type\n        }\n      }\n    }\n  }\n": typeof types.GetKnownThreatsDocument,
    "\n  subscription KnownThreatsChanged($campaignId: ID!) {\n    knownThreatsChanged(campaignId: $campaignId)\n  }\n": typeof types.KnownThreatsChangedDocument,
    "\n  query GetCampaignMonsters($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        encounters {\n          id\n          monsters {\n            id\n          }\n          name\n        }\n        id\n        monsters {\n          encounterId\n          hp\n          id\n          maxHp\n          name\n          statBlock {\n            ...MonsterFragment\n          }\n        }\n      }\n    }\n    monsters {\n      compendium {\n        hp\n        id\n        name\n        setting {\n          key\n          name\n        }\n        tags\n      }\n      mine {\n        hp\n        id\n        name\n        tags\n      }\n    }\n  }\n": typeof types.GetCampaignMonstersDocument,
    "\n  mutation AddMonsters($id: ID!, $input: AddMonstersInput!) {\n    campaigns {\n      addMonsters(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n": typeof types.AddMonstersDocument,
    "\n  mutation DamageMonster($input: TakeDamageInput!, $monsterId: ID!) {\n    campaigns {\n      damageMonster(input: $input, monsterId: $monsterId) {\n        hp\n        id\n      }\n    }\n  }\n": typeof types.DamageMonsterDocument,
    "\n  mutation HealMonster($amount: Int!, $monsterId: ID!) {\n    campaigns {\n      healMonster(amount: $amount, monsterId: $monsterId) {\n        hp\n        id\n      }\n    }\n  }\n": typeof types.HealMonsterDocument,
    "\n  mutation RenameMonster($monsterId: ID!, $name: String!) {\n    campaigns {\n      renameMonster(monsterId: $monsterId, name: $name) {\n        id\n        name\n      }\n    }\n  }\n": typeof types.RenameMonsterDocument,
    "\n  mutation RunEncounter($encounterId: ID!) {\n    campaigns {\n      runEncounter(encounterId: $encounterId) {\n        id\n      }\n    }\n  }\n": typeof types.RunEncounterDocument,
    "\n  mutation RemoveMonster($monsterId: ID!) {\n    campaigns {\n      removeMonster(monsterId: $monsterId)\n    }\n  }\n": typeof types.RemoveMonsterDocument,
    "\n  mutation LeaveCampaign($characterId: ID!) {\n    campaigns {\n      leave(characterId: $characterId) {\n        id\n      }\n    }\n  }\n": typeof types.LeaveCampaignDocument,
    "\n  mutation RemoveCharacter($characterId: ID!, $id: ID!) {\n    campaigns {\n      removeCharacter(characterId: $characterId, id: $id) {\n        id\n      }\n    }\n  }\n": typeof types.RemoveCharacterDocument,
    "\n  mutation DeleteDanger($dangerId: ID!) {\n    campaigns {\n      deleteDanger(dangerId: $dangerId)\n    }\n  }\n": typeof types.DeleteDangerDocument,
    "\n  mutation CreateDanger($id: ID!, $input: DangerInput!) {\n    campaigns {\n      createDanger(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n": typeof types.CreateDangerDocument,
    "\n  mutation UpdateDanger($dangerId: ID!, $input: DangerInput!) {\n    campaigns {\n      updateDanger(dangerId: $dangerId, input: $input) {\n        ...DangerFragment\n      }\n    }\n  }\n": typeof types.UpdateDangerDocument,
    "\n  mutation AddEncounterMonsters($encounterId: ID!, $input: AddMonstersInput!) {\n    campaigns {\n      addEncounterMonsters(encounterId: $encounterId, input: $input) {\n        id\n      }\n    }\n  }\n": typeof types.AddEncounterMonstersDocument,
    "\n  mutation SetEncounterMonsterCount($count: Int!, $encounterMonsterId: ID!) {\n    campaigns {\n      setEncounterMonsterCount(\n        count: $count\n        encounterMonsterId: $encounterMonsterId\n      ) {\n        id\n      }\n    }\n  }\n": typeof types.SetEncounterMonsterCountDocument,
    "\n  mutation RemoveEncounterMonster($encounterMonsterId: ID!) {\n    campaigns {\n      removeEncounterMonster(encounterMonsterId: $encounterMonsterId) {\n        id\n      }\n    }\n  }\n": typeof types.RemoveEncounterMonsterDocument,
    "\n  mutation DeleteEncounter($encounterId: ID!) {\n    campaigns {\n      deleteEncounter(encounterId: $encounterId)\n    }\n  }\n": typeof types.DeleteEncounterDocument,
    "\n  mutation CreateEncounter($id: ID!, $input: EncounterInput!) {\n    campaigns {\n      createEncounter(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n": typeof types.CreateEncounterDocument,
    "\n  mutation UpdateEncounter($encounterId: ID!, $input: EncounterInput!) {\n    campaigns {\n      updateEncounter(encounterId: $encounterId, input: $input) {\n        id\n      }\n    }\n  }\n": typeof types.UpdateEncounterDocument,
    "\n  mutation SetFrontResolved($frontId: ID!, $resolved: Boolean!) {\n    campaigns {\n      setFrontResolved(frontId: $frontId, resolved: $resolved) {\n        id\n        resolved\n      }\n    }\n  }\n": typeof types.SetFrontResolvedDocument,
    "\n  mutation DeleteFront($frontId: ID!) {\n    campaigns {\n      deleteFront(frontId: $frontId)\n    }\n  }\n": typeof types.DeleteFrontDocument,
    "\n  mutation CreateFront($id: ID!, $input: FrontInput!) {\n    campaigns {\n      createFront(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n": typeof types.CreateFrontDocument,
    "\n  mutation UpdateFront($frontId: ID!, $input: FrontInput!) {\n    campaigns {\n      updateFront(frontId: $frontId, input: $input) {\n        id\n      }\n    }\n  }\n": typeof types.UpdateFrontDocument,
    "\n  query GetPrep($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        dangersWithoutFront {\n          ...DangerFragment\n        }\n        encounters {\n          danger {\n            id\n            name\n          }\n          id\n          location\n          monsters {\n            count\n            id\n            maxHp\n            statBlock {\n              armor\n              name\n            }\n          }\n          name\n          notes\n        }\n        fronts {\n          dangers {\n            ...DangerFragment\n          }\n          id\n          kind\n          name\n          notes\n          resolved\n          stakes {\n            answer\n            question\n          }\n        }\n        id\n        name\n      }\n    }\n    dangerTemplate {\n      categories {\n        key\n        name\n        types {\n          impulse\n          key\n          name\n        }\n      }\n      impendingDooms {\n        description\n        key\n        name\n      }\n    }\n    monsters {\n      compendium {\n        hp\n        id\n        name\n        setting {\n          key\n          name\n        }\n        tags\n      }\n      mine {\n        hp\n        id\n        name\n        tags\n      }\n    }\n  }\n": typeof types.GetPrepDocument,
    "\n  query GetMyCampaigns {\n    campaigns {\n      mine {\n        id\n        isGm\n        name\n      }\n    }\n  }\n": typeof types.GetMyCampaignsDocument,
    "\n  mutation SetDebility($active: Boolean!, $debility: Debility!, $id: ID!) {\n    characters {\n      setDebility(active: $active, debility: $debility, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.SetDebilityDocument,
    "\n  mutation AddItem($characterId: ID!, $input: AddItemInput!) {\n    items {\n      add(characterId: $characterId, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.AddItemDocument,
    "\n  query ItemTemplates {\n    itemTemplates {\n      all {\n        key\n        label\n        type\n      }\n    }\n  }\n": typeof types.ItemTemplatesDocument,
    "\n  mutation AddBond($id: ID!, $input: BondInput!) {\n    characters {\n      addBond(id: $id, input: $input) {\n        ...CampaignCharacterFragment\n      }\n    }\n  }\n": typeof types.AddBondDocument,
    "\n  mutation DeleteBond($bondId: ID!) {\n    characters {\n      deleteBond(bondId: $bondId) {\n        ...CampaignCharacterFragment\n      }\n    }\n  }\n": typeof types.DeleteBondDocument,
    "\n  mutation UpdateBond($bondId: ID!, $text: String!) {\n    characters {\n      updateBond(bondId: $bondId, text: $text) {\n        ...CampaignCharacterFragment\n      }\n    }\n  }\n": typeof types.UpdateBondDocument,
    "\n  mutation AddBonus($id: ID!, $input: BonusInput!) {\n    characters {\n      addBonus(id: $id, input: $input) {\n        bonuses {\n          ...BonusFragment\n        }\n        id\n      }\n    }\n  }\n": typeof types.AddBonusDocument,
    "\n  mutation RemoveBonusFromSheet($bonusId: ID!) {\n    characters {\n      removeBonus(bonusId: $bonusId) {\n        bonuses {\n          ...BonusFragment\n        }\n        id\n      }\n    }\n  }\n": typeof types.RemoveBonusFromSheetDocument,
    "\n  mutation AdjustGold($delta: Int!, $id: ID!) {\n    characters {\n      adjustGold(delta: $delta, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.AdjustGoldDocument,
    "\n  mutation RemoveItem($id: ID!) {\n    items {\n      remove(id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.RemoveItemDocument,
    "\n  mutation SetItemCount($count: Int!, $id: ID!) {\n    items {\n      setCount(count: $count, id: $id) {\n        ...ItemFragment\n      }\n    }\n  }\n": typeof types.SetItemCountDocument,
    "\n  mutation ToggleItemWorn($id: ID!, $worn: Boolean!) {\n    items {\n      setWorn(id: $id, worn: $worn) {\n        ...ItemFragment\n      }\n    }\n  }\n": typeof types.ToggleItemWornDocument,
    "\n  mutation AdjustXp($delta: Int!, $id: ID!) {\n    characters {\n      adjustXp(delta: $delta, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.AdjustXpDocument,
    "\n  query GetCharacter($id: ID!) {\n    characters {\n      byId(id: $id) {\n        ...CharacterFragment\n      }\n    }\n    moves {\n      basicMoves: byType(type: \"basic\") {\n        ...MoveFragment\n      }\n      specialMoves: byType(type: \"special\") {\n        ...MoveFragment\n      }\n    }\n  }\n": typeof types.GetCharacterDocument,
    "\n  mutation Heal($amount: Int!, $id: ID!) {\n    characters {\n      heal(amount: $amount, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.HealDocument,
    "\n  mutation TakeDamage($id: ID!, $input: TakeDamageInput!) {\n    characters {\n      takeDamage(id: $id, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.TakeDamageDocument,
    "\n  mutation LevelUp($id: ID!, $input: LevelUpInput!) {\n    characters {\n      levelUp(id: $id, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.LevelUpDocument,
    "\n  mutation PrepareSpells($characterId: ID!, $spellKeys: [ID!]!) {\n    spells {\n      prepare(characterId: $characterId, spellKeys: $spellKeys) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.PrepareSpellsDocument,
    "\n  mutation AddToSpellbook($characterId: ID!, $spellKey: ID!) {\n    spells {\n      addToSpellbook(characterId: $characterId, spellKey: $spellKey) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.AddToSpellbookDocument,
    "\n  mutation RemoveFromSpellbook($characterId: ID!, $spellKey: ID!) {\n    spells {\n      removeFromSpellbook(characterId: $characterId, spellKey: $spellKey) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.RemoveFromSpellbookDocument,
    "\n  mutation SetSpellForgotten(\n    $characterId: ID!\n    $forgotten: Boolean!\n    $spellKey: ID!\n  ) {\n    spells {\n      setForgotten(\n        characterId: $characterId\n        forgotten: $forgotten\n        spellKey: $spellKey\n      ) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.SetSpellForgottenDocument,
    "\n  query SpellsByClass($classKey: ID!) {\n    spells {\n      byClass(classKey: $classKey) {\n        ...SpellFragment\n      }\n    }\n  }\n": typeof types.SpellsByClassDocument,
    "\n  query GetCharacterClassesForCreate {\n    characterClasses {\n      all {\n        alignmentTemplates {\n          alignment\n          description\n        }\n        bonds\n        damageDie\n        hpBase\n        key\n        lookExamples {\n          examples\n          type\n        }\n        name\n        raceMoves {\n          key\n          ...MoveFragment\n        }\n        startingGear {\n          default {\n            ...ItemOptionFragment\n          }\n          loadBase\n          options {\n            pick\n            choices {\n              ...ItemOptionFragment\n            }\n          }\n        }\n        startingMoves {\n          key\n          ...MoveFragment\n        }\n      }\n    }\n    lookTypes {\n      all {\n        examples\n        key\n        name\n      }\n    }\n  }\n": typeof types.GetCharacterClassesForCreateDocument,
    "\n  mutation CreateCharacter($input: CreateCharacterInput!) {\n    characters {\n      create(input: $input) {\n        id\n        name\n      }\n    }\n  }\n": typeof types.CreateCharacterDocument,
    "\n  mutation JoinCampaign($characterId: ID!, $code: String!) {\n    campaigns {\n      join(characterId: $characterId, code: $code) {\n        id\n      }\n    }\n  }\n": typeof types.JoinCampaignDocument,
    "\n  query GetInvite($code: String!) {\n    campaigns {\n      byInviteCode(code: $code) {\n        gm {\n          displayName\n        }\n        name\n      }\n    }\n    characters {\n      mine {\n        campaign {\n          id\n        }\n        id\n        name\n      }\n    }\n  }\n": typeof types.GetInviteDocument,
    "\n  query GetMonsters {\n    monsters {\n      compendium {\n        armor\n        hp\n        id\n        name\n        setting {\n          key\n          name\n        }\n        tags\n      }\n      mine {\n        armor\n        hp\n        id\n        name\n        tags\n      }\n      settings {\n        key\n        name\n      }\n      tags\n    }\n  }\n": typeof types.GetMonstersDocument,
    "\n  query GetCompendiumMonster($key: ID!) {\n    monsters {\n      byKey(key: $key) {\n        ...MonsterFragment\n      }\n    }\n  }\n": typeof types.GetCompendiumMonsterDocument,
    "\n  mutation UpdateCustomMonster($id: ID!, $input: MonsterInput!) {\n    monsters {\n      updateCustom(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n": typeof types.UpdateCustomMonsterDocument,
    "\n  mutation DeleteCustomMonster($id: ID!) {\n    monsters {\n      deleteCustom(id: $id)\n    }\n  }\n": typeof types.DeleteCustomMonsterDocument,
    "\n  query GetCustomMonster($id: ID!) {\n    monsters {\n      custom(id: $id) {\n        ...MonsterFragment\n      }\n      tags\n    }\n  }\n": typeof types.GetCustomMonsterDocument,
    "\n  mutation CreateCustomMonster($input: MonsterInput!) {\n    monsters {\n      createCustom(input: $input) {\n        id\n      }\n    }\n  }\n": typeof types.CreateCustomMonsterDocument,
    "\n  query GetNewMonster($from: ID!, $copying: Boolean!) {\n    monsters {\n      byKey(key: $from) @include(if: $copying) {\n        ...MonsterFragment\n      }\n      tags\n    }\n  }\n": typeof types.GetNewMonsterDocument,
    "\n  query GetMyCharacters {\n    characters {\n      mine {\n        id\n        name\n      }\n    }\n  }\n": typeof types.GetMyCharactersDocument,
    "\n  mutation Login($input: LoginInput!) {\n    auth {\n      login(input: $input) {\n        id\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    auth {\n      register(input: $input) {\n        id\n      }\n    }\n  }\n": typeof types.RegisterDocument,
    "\n  mutation PostDamage($id: ID!, $input: DamageRollInput!) {\n    campaigns {\n      postDamage(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n": typeof types.PostDamageDocument,
    "\n  mutation PostMonsterDamage($input: DamageRollInput!, $monsterId: ID!) {\n    campaigns {\n      postMonsterDamage(input: $input, monsterId: $monsterId) {\n        id\n      }\n    }\n  }\n": typeof types.PostMonsterDamageDocument,
    "\n  mutation Logout {\n    auth {\n      logout\n    }\n  }\n": typeof types.LogoutDocument,
    "\n  mutation PostRoll($id: ID!, $input: RollInput!) {\n    campaigns {\n      postRoll(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n": typeof types.PostRollDocument,
    "\n  mutation RemoveBonus($bonusId: ID!) {\n    characters {\n      removeBonus(bonusId: $bonusId) {\n        bonuses {\n          ...BonusFragment\n        }\n        id\n      }\n    }\n  }\n": typeof types.RemoveBonusDocument,
    "\n  mutation SubmitSessionReport($id: ID!, $input: SessionReportInput!) {\n    characters {\n      submitSessionReport(id: $id, input: $input) {\n        ...CampaignCharacterFragment\n      }\n    }\n  }\n": typeof types.SubmitSessionReportDocument,
    "\n  fragment BonusFragment on Bonus {\n    amount\n    id\n    kind\n    label\n  }\n": typeof types.BonusFragmentFragmentDoc,
    "\n  fragment CampaignCharacterFragment on Character {\n    alignmentDescription\n    alignmentType\n    bonds {\n      id\n      target {\n        id\n        name\n      }\n      text\n    }\n    campaign {\n      characters {\n        id\n        name\n      }\n      id\n      isGm\n      name\n    }\n    characterClass {\n      bonds\n      key\n    }\n    id\n    name\n    pendingSession {\n      id\n      learned {\n        checked\n      }\n      looted {\n        checked\n      }\n      number\n      overcame {\n        checked\n      }\n    }\n    viewerIsOwner\n    xp\n  }\n": typeof types.CampaignCharacterFragmentFragmentDoc,
    "\n  fragment CharacterFragment on Character {\n    abilities {\n      ability\n      modifier\n      score\n    }\n    advancedMoves {\n      ...MoveFragment\n    }\n    alignmentDescription\n    alignmentType\n    armor\n    availableAdvancedMoves {\n      ...MoveFragment\n    }\n    bonuses {\n      ...BonusFragment\n    }\n    campaign {\n      id\n      isGm\n      name\n    }\n    canLevelUp\n    characterClass {\n      damageDie\n      hpBase\n      key\n      name\n    }\n    classMoves {\n      ...MoveFragment\n    }\n    debilities\n    equipment {\n      ...ItemFragment\n    }\n    gold\n    hitPoints\n    id\n    expectedSpellbookSize\n    isDying\n    level\n    load\n    looks {\n      id\n      lookType {\n        key\n        name\n      }\n      value\n    }\n    maxHitPoints\n    maxLoad\n    maxPreparedSpellLevels\n    name\n    preparedSpellLevels\n    preparedSpells {\n      isForgotten\n      spell {\n        ...SpellFragment\n      }\n    }\n    raceMove {\n      ...MoveFragment\n    }\n    spellbook {\n      ...SpellFragment\n    }\n    viewerIsOwner\n    xp\n    xpToLevel\n    ...CampaignCharacterFragment\n  }\n": typeof types.CharacterFragmentFragmentDoc,
    "\n  fragment DangerFragment on Danger {\n    category {\n      key\n      moves\n      name\n    }\n    frontId\n    id\n    impendingDoom\n    impulse\n    name\n    notes\n    portents {\n      done\n      id\n      revealed\n      text\n    }\n    revealed\n    type\n  }\n": typeof types.DangerFragmentFragmentDoc,
    "\n  fragment ItemFragment on Item {\n    count\n    description\n    id\n    isWorn\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n    type\n  }\n": typeof types.ItemFragmentFragmentDoc,
    "\n  fragment ItemOptionFragment on ItemOption {\n    count\n    description\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n  }\n": typeof types.ItemOptionFragmentFragmentDoc,
    "\n  fragment MessageFragment on Message {\n    authorIsGm\n    authorName\n    body\n    characterId\n    characterName\n    createdAt\n    gmOnly\n    id\n    kind\n    ooc\n    roll {\n      band\n      dice {\n        dropped\n        sides\n        value\n      }\n      diceTotal\n      label\n      modifiers {\n        label\n        value\n      }\n      move {\n        key\n        name\n        on10\n        on7to9\n        onMiss\n      }\n      source\n      total\n    }\n    viewerIsAuthor\n    whisperTo\n  }\n": typeof types.MessageFragmentFragmentDoc,
    "\n  fragment MonsterFragment on Monster {\n    armor\n    attack {\n      damage\n      ignoresArmor\n      name\n      piercing\n      tags\n    }\n    description\n    hp\n    id\n    instinct\n    moves\n    name\n    setting {\n      key\n      name\n    }\n    source\n    sourceKey\n    specialQualities\n    tags\n  }\n": typeof types.MonsterFragmentFragmentDoc,
    "\n  fragment MoveFragment on Move {\n    creationOptions {\n      choices {\n        isPicked\n        key\n        label\n      }\n      label\n      pick\n    }\n    description\n    key\n    name\n    on10\n    on7to9\n    onMiss\n    options\n    replacesKey\n    requiresKey\n    roll\n    trigger\n    type\n  }\n": typeof types.MoveFragmentFragmentDoc,
    "\n  fragment SpellFragment on Spell {\n    description\n    key\n    level\n    name\n    options\n    tags\n  }\n": typeof types.SpellFragmentFragmentDoc,
    "\n  query Me {\n    me {\n      displayName\n      email\n      id\n    }\n  }\n": typeof types.MeDocument,
};
const documents: Documents = {
    "\n  mutation CreateCampaign($input: CampaignInput!) {\n    campaigns {\n      create(input: $input) {\n        id\n      }\n    }\n  }\n": types.CreateCampaignDocument,
    "\n  mutation UpdateCampaign($id: ID!, $input: CampaignInput!) {\n    campaigns {\n      update(id: $id, input: $input) {\n        description\n        id\n        name\n      }\n    }\n  }\n": types.UpdateCampaignDocument,
    "\n  mutation DeleteCampaign($id: ID!) {\n    campaigns {\n      delete(id: $id)\n    }\n  }\n": types.DeleteCampaignDocument,
    "\n  mutation MarkXpForMiss($id: ID!) {\n    characters {\n      adjustXp(delta: 1, id: $id) {\n        id\n        xp\n      }\n    }\n  }\n": types.MarkXpForMissDocument,
    "\n  query GetCampaignMessages($before: ID, $id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        id\n        messages(before: $before) {\n          hasMore\n          messages {\n            id\n            ...MessageFragment\n          }\n        }\n      }\n    }\n  }\n": types.GetCampaignMessagesDocument,
    "\n  subscription CampaignMessages($campaignId: ID!) {\n    campaignMessages(campaignId: $campaignId) {\n      id\n      ...MessageFragment\n    }\n  }\n": types.CampaignMessagesDocument,
    "\n  mutation PostMessage($id: ID!, $input: MessageInput!) {\n    campaigns {\n      postMessage(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n": types.PostMessageDocument,
    "\n  mutation SetDangerRevealed($dangerId: ID!, $revealed: Boolean!) {\n    campaigns {\n      setDangerRevealed(dangerId: $dangerId, revealed: $revealed) {\n        ...DangerFragment\n      }\n    }\n  }\n": types.SetDangerRevealedDocument,
    "\n  mutation SetPortentDone($done: Boolean!, $portentId: ID!) {\n    campaigns {\n      setPortentDone(done: $done, portentId: $portentId) {\n        ...DangerFragment\n      }\n    }\n  }\n": types.SetPortentDoneDocument,
    "\n  mutation SetPortentRevealed($portentId: ID!, $revealed: Boolean!) {\n    campaigns {\n      setPortentRevealed(portentId: $portentId, revealed: $revealed) {\n        ...DangerFragment\n      }\n    }\n  }\n": types.SetPortentRevealedDocument,
    "\n  mutation EndSession($id: ID!, $input: EndSessionInput!) {\n    campaigns {\n      endSession(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n": types.EndSessionDocument,
    "\n  query GetCampaignDangers($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        dangersWithoutFront {\n          ...DangerFragment\n        }\n        fronts {\n          dangers {\n            ...DangerFragment\n          }\n          id\n          name\n          resolved\n        }\n        id\n      }\n    }\n  }\n": types.GetCampaignDangersDocument,
    "\n  query GetCampaign($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        characters {\n          alignmentType\n          bondCount\n          characterClass {\n            name\n          }\n          hitPoints\n          id\n          looks {\n            id\n            value\n          }\n          maxHitPoints\n          name\n          owner {\n            displayName\n          }\n          raceMove {\n            name\n          }\n        }\n        description\n        gm {\n          displayName\n        }\n        id\n        inviteCode\n        isGm\n        myCharacter {\n          id\n          ...CampaignCharacterFragment\n          ...CharacterFragment\n        }\n        name\n        sessions {\n          createdAt\n          id\n          learned {\n            checked\n            reason\n          }\n          looted {\n            checked\n            reason\n          }\n          number\n          overcame {\n            checked\n            reason\n          }\n          reports {\n            alignment {\n              checked\n              reason\n            }\n            bond {\n              checked\n              reason\n            }\n            character {\n              id\n              name\n            }\n            resolvedBondText\n            xpAwarded\n          }\n        }\n      }\n    }\n    moves {\n      basicMoves: byType(type: \"basic\") {\n        ...MoveFragment\n      }\n      specialMoves: byType(type: \"special\") {\n        ...MoveFragment\n      }\n    }\n  }\n": types.GetCampaignDocument,
    "\n  mutation RegenerateInviteCode($id: ID!) {\n    campaigns {\n      regenerateInviteCode(id: $id) {\n        id\n        inviteCode\n      }\n    }\n  }\n": types.RegenerateInviteCodeDocument,
    "\n  query GetKnownThreats($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        id\n        knownThreats {\n          dangerId\n          name\n          portents\n          type\n        }\n      }\n    }\n  }\n": types.GetKnownThreatsDocument,
    "\n  subscription KnownThreatsChanged($campaignId: ID!) {\n    knownThreatsChanged(campaignId: $campaignId)\n  }\n": types.KnownThreatsChangedDocument,
    "\n  query GetCampaignMonsters($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        encounters {\n          id\n          monsters {\n            id\n          }\n          name\n        }\n        id\n        monsters {\n          encounterId\n          hp\n          id\n          maxHp\n          name\n          statBlock {\n            ...MonsterFragment\n          }\n        }\n      }\n    }\n    monsters {\n      compendium {\n        hp\n        id\n        name\n        setting {\n          key\n          name\n        }\n        tags\n      }\n      mine {\n        hp\n        id\n        name\n        tags\n      }\n    }\n  }\n": types.GetCampaignMonstersDocument,
    "\n  mutation AddMonsters($id: ID!, $input: AddMonstersInput!) {\n    campaigns {\n      addMonsters(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n": types.AddMonstersDocument,
    "\n  mutation DamageMonster($input: TakeDamageInput!, $monsterId: ID!) {\n    campaigns {\n      damageMonster(input: $input, monsterId: $monsterId) {\n        hp\n        id\n      }\n    }\n  }\n": types.DamageMonsterDocument,
    "\n  mutation HealMonster($amount: Int!, $monsterId: ID!) {\n    campaigns {\n      healMonster(amount: $amount, monsterId: $monsterId) {\n        hp\n        id\n      }\n    }\n  }\n": types.HealMonsterDocument,
    "\n  mutation RenameMonster($monsterId: ID!, $name: String!) {\n    campaigns {\n      renameMonster(monsterId: $monsterId, name: $name) {\n        id\n        name\n      }\n    }\n  }\n": types.RenameMonsterDocument,
    "\n  mutation RunEncounter($encounterId: ID!) {\n    campaigns {\n      runEncounter(encounterId: $encounterId) {\n        id\n      }\n    }\n  }\n": types.RunEncounterDocument,
    "\n  mutation RemoveMonster($monsterId: ID!) {\n    campaigns {\n      removeMonster(monsterId: $monsterId)\n    }\n  }\n": types.RemoveMonsterDocument,
    "\n  mutation LeaveCampaign($characterId: ID!) {\n    campaigns {\n      leave(characterId: $characterId) {\n        id\n      }\n    }\n  }\n": types.LeaveCampaignDocument,
    "\n  mutation RemoveCharacter($characterId: ID!, $id: ID!) {\n    campaigns {\n      removeCharacter(characterId: $characterId, id: $id) {\n        id\n      }\n    }\n  }\n": types.RemoveCharacterDocument,
    "\n  mutation DeleteDanger($dangerId: ID!) {\n    campaigns {\n      deleteDanger(dangerId: $dangerId)\n    }\n  }\n": types.DeleteDangerDocument,
    "\n  mutation CreateDanger($id: ID!, $input: DangerInput!) {\n    campaigns {\n      createDanger(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n": types.CreateDangerDocument,
    "\n  mutation UpdateDanger($dangerId: ID!, $input: DangerInput!) {\n    campaigns {\n      updateDanger(dangerId: $dangerId, input: $input) {\n        ...DangerFragment\n      }\n    }\n  }\n": types.UpdateDangerDocument,
    "\n  mutation AddEncounterMonsters($encounterId: ID!, $input: AddMonstersInput!) {\n    campaigns {\n      addEncounterMonsters(encounterId: $encounterId, input: $input) {\n        id\n      }\n    }\n  }\n": types.AddEncounterMonstersDocument,
    "\n  mutation SetEncounterMonsterCount($count: Int!, $encounterMonsterId: ID!) {\n    campaigns {\n      setEncounterMonsterCount(\n        count: $count\n        encounterMonsterId: $encounterMonsterId\n      ) {\n        id\n      }\n    }\n  }\n": types.SetEncounterMonsterCountDocument,
    "\n  mutation RemoveEncounterMonster($encounterMonsterId: ID!) {\n    campaigns {\n      removeEncounterMonster(encounterMonsterId: $encounterMonsterId) {\n        id\n      }\n    }\n  }\n": types.RemoveEncounterMonsterDocument,
    "\n  mutation DeleteEncounter($encounterId: ID!) {\n    campaigns {\n      deleteEncounter(encounterId: $encounterId)\n    }\n  }\n": types.DeleteEncounterDocument,
    "\n  mutation CreateEncounter($id: ID!, $input: EncounterInput!) {\n    campaigns {\n      createEncounter(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n": types.CreateEncounterDocument,
    "\n  mutation UpdateEncounter($encounterId: ID!, $input: EncounterInput!) {\n    campaigns {\n      updateEncounter(encounterId: $encounterId, input: $input) {\n        id\n      }\n    }\n  }\n": types.UpdateEncounterDocument,
    "\n  mutation SetFrontResolved($frontId: ID!, $resolved: Boolean!) {\n    campaigns {\n      setFrontResolved(frontId: $frontId, resolved: $resolved) {\n        id\n        resolved\n      }\n    }\n  }\n": types.SetFrontResolvedDocument,
    "\n  mutation DeleteFront($frontId: ID!) {\n    campaigns {\n      deleteFront(frontId: $frontId)\n    }\n  }\n": types.DeleteFrontDocument,
    "\n  mutation CreateFront($id: ID!, $input: FrontInput!) {\n    campaigns {\n      createFront(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n": types.CreateFrontDocument,
    "\n  mutation UpdateFront($frontId: ID!, $input: FrontInput!) {\n    campaigns {\n      updateFront(frontId: $frontId, input: $input) {\n        id\n      }\n    }\n  }\n": types.UpdateFrontDocument,
    "\n  query GetPrep($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        dangersWithoutFront {\n          ...DangerFragment\n        }\n        encounters {\n          danger {\n            id\n            name\n          }\n          id\n          location\n          monsters {\n            count\n            id\n            maxHp\n            statBlock {\n              armor\n              name\n            }\n          }\n          name\n          notes\n        }\n        fronts {\n          dangers {\n            ...DangerFragment\n          }\n          id\n          kind\n          name\n          notes\n          resolved\n          stakes {\n            answer\n            question\n          }\n        }\n        id\n        name\n      }\n    }\n    dangerTemplate {\n      categories {\n        key\n        name\n        types {\n          impulse\n          key\n          name\n        }\n      }\n      impendingDooms {\n        description\n        key\n        name\n      }\n    }\n    monsters {\n      compendium {\n        hp\n        id\n        name\n        setting {\n          key\n          name\n        }\n        tags\n      }\n      mine {\n        hp\n        id\n        name\n        tags\n      }\n    }\n  }\n": types.GetPrepDocument,
    "\n  query GetMyCampaigns {\n    campaigns {\n      mine {\n        id\n        isGm\n        name\n      }\n    }\n  }\n": types.GetMyCampaignsDocument,
    "\n  mutation SetDebility($active: Boolean!, $debility: Debility!, $id: ID!) {\n    characters {\n      setDebility(active: $active, debility: $debility, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.SetDebilityDocument,
    "\n  mutation AddItem($characterId: ID!, $input: AddItemInput!) {\n    items {\n      add(characterId: $characterId, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.AddItemDocument,
    "\n  query ItemTemplates {\n    itemTemplates {\n      all {\n        key\n        label\n        type\n      }\n    }\n  }\n": types.ItemTemplatesDocument,
    "\n  mutation AddBond($id: ID!, $input: BondInput!) {\n    characters {\n      addBond(id: $id, input: $input) {\n        ...CampaignCharacterFragment\n      }\n    }\n  }\n": types.AddBondDocument,
    "\n  mutation DeleteBond($bondId: ID!) {\n    characters {\n      deleteBond(bondId: $bondId) {\n        ...CampaignCharacterFragment\n      }\n    }\n  }\n": types.DeleteBondDocument,
    "\n  mutation UpdateBond($bondId: ID!, $text: String!) {\n    characters {\n      updateBond(bondId: $bondId, text: $text) {\n        ...CampaignCharacterFragment\n      }\n    }\n  }\n": types.UpdateBondDocument,
    "\n  mutation AddBonus($id: ID!, $input: BonusInput!) {\n    characters {\n      addBonus(id: $id, input: $input) {\n        bonuses {\n          ...BonusFragment\n        }\n        id\n      }\n    }\n  }\n": types.AddBonusDocument,
    "\n  mutation RemoveBonusFromSheet($bonusId: ID!) {\n    characters {\n      removeBonus(bonusId: $bonusId) {\n        bonuses {\n          ...BonusFragment\n        }\n        id\n      }\n    }\n  }\n": types.RemoveBonusFromSheetDocument,
    "\n  mutation AdjustGold($delta: Int!, $id: ID!) {\n    characters {\n      adjustGold(delta: $delta, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.AdjustGoldDocument,
    "\n  mutation RemoveItem($id: ID!) {\n    items {\n      remove(id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.RemoveItemDocument,
    "\n  mutation SetItemCount($count: Int!, $id: ID!) {\n    items {\n      setCount(count: $count, id: $id) {\n        ...ItemFragment\n      }\n    }\n  }\n": types.SetItemCountDocument,
    "\n  mutation ToggleItemWorn($id: ID!, $worn: Boolean!) {\n    items {\n      setWorn(id: $id, worn: $worn) {\n        ...ItemFragment\n      }\n    }\n  }\n": types.ToggleItemWornDocument,
    "\n  mutation AdjustXp($delta: Int!, $id: ID!) {\n    characters {\n      adjustXp(delta: $delta, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.AdjustXpDocument,
    "\n  query GetCharacter($id: ID!) {\n    characters {\n      byId(id: $id) {\n        ...CharacterFragment\n      }\n    }\n    moves {\n      basicMoves: byType(type: \"basic\") {\n        ...MoveFragment\n      }\n      specialMoves: byType(type: \"special\") {\n        ...MoveFragment\n      }\n    }\n  }\n": types.GetCharacterDocument,
    "\n  mutation Heal($amount: Int!, $id: ID!) {\n    characters {\n      heal(amount: $amount, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.HealDocument,
    "\n  mutation TakeDamage($id: ID!, $input: TakeDamageInput!) {\n    characters {\n      takeDamage(id: $id, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.TakeDamageDocument,
    "\n  mutation LevelUp($id: ID!, $input: LevelUpInput!) {\n    characters {\n      levelUp(id: $id, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.LevelUpDocument,
    "\n  mutation PrepareSpells($characterId: ID!, $spellKeys: [ID!]!) {\n    spells {\n      prepare(characterId: $characterId, spellKeys: $spellKeys) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.PrepareSpellsDocument,
    "\n  mutation AddToSpellbook($characterId: ID!, $spellKey: ID!) {\n    spells {\n      addToSpellbook(characterId: $characterId, spellKey: $spellKey) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.AddToSpellbookDocument,
    "\n  mutation RemoveFromSpellbook($characterId: ID!, $spellKey: ID!) {\n    spells {\n      removeFromSpellbook(characterId: $characterId, spellKey: $spellKey) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.RemoveFromSpellbookDocument,
    "\n  mutation SetSpellForgotten(\n    $characterId: ID!\n    $forgotten: Boolean!\n    $spellKey: ID!\n  ) {\n    spells {\n      setForgotten(\n        characterId: $characterId\n        forgotten: $forgotten\n        spellKey: $spellKey\n      ) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.SetSpellForgottenDocument,
    "\n  query SpellsByClass($classKey: ID!) {\n    spells {\n      byClass(classKey: $classKey) {\n        ...SpellFragment\n      }\n    }\n  }\n": types.SpellsByClassDocument,
    "\n  query GetCharacterClassesForCreate {\n    characterClasses {\n      all {\n        alignmentTemplates {\n          alignment\n          description\n        }\n        bonds\n        damageDie\n        hpBase\n        key\n        lookExamples {\n          examples\n          type\n        }\n        name\n        raceMoves {\n          key\n          ...MoveFragment\n        }\n        startingGear {\n          default {\n            ...ItemOptionFragment\n          }\n          loadBase\n          options {\n            pick\n            choices {\n              ...ItemOptionFragment\n            }\n          }\n        }\n        startingMoves {\n          key\n          ...MoveFragment\n        }\n      }\n    }\n    lookTypes {\n      all {\n        examples\n        key\n        name\n      }\n    }\n  }\n": types.GetCharacterClassesForCreateDocument,
    "\n  mutation CreateCharacter($input: CreateCharacterInput!) {\n    characters {\n      create(input: $input) {\n        id\n        name\n      }\n    }\n  }\n": types.CreateCharacterDocument,
    "\n  mutation JoinCampaign($characterId: ID!, $code: String!) {\n    campaigns {\n      join(characterId: $characterId, code: $code) {\n        id\n      }\n    }\n  }\n": types.JoinCampaignDocument,
    "\n  query GetInvite($code: String!) {\n    campaigns {\n      byInviteCode(code: $code) {\n        gm {\n          displayName\n        }\n        name\n      }\n    }\n    characters {\n      mine {\n        campaign {\n          id\n        }\n        id\n        name\n      }\n    }\n  }\n": types.GetInviteDocument,
    "\n  query GetMonsters {\n    monsters {\n      compendium {\n        armor\n        hp\n        id\n        name\n        setting {\n          key\n          name\n        }\n        tags\n      }\n      mine {\n        armor\n        hp\n        id\n        name\n        tags\n      }\n      settings {\n        key\n        name\n      }\n      tags\n    }\n  }\n": types.GetMonstersDocument,
    "\n  query GetCompendiumMonster($key: ID!) {\n    monsters {\n      byKey(key: $key) {\n        ...MonsterFragment\n      }\n    }\n  }\n": types.GetCompendiumMonsterDocument,
    "\n  mutation UpdateCustomMonster($id: ID!, $input: MonsterInput!) {\n    monsters {\n      updateCustom(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n": types.UpdateCustomMonsterDocument,
    "\n  mutation DeleteCustomMonster($id: ID!) {\n    monsters {\n      deleteCustom(id: $id)\n    }\n  }\n": types.DeleteCustomMonsterDocument,
    "\n  query GetCustomMonster($id: ID!) {\n    monsters {\n      custom(id: $id) {\n        ...MonsterFragment\n      }\n      tags\n    }\n  }\n": types.GetCustomMonsterDocument,
    "\n  mutation CreateCustomMonster($input: MonsterInput!) {\n    monsters {\n      createCustom(input: $input) {\n        id\n      }\n    }\n  }\n": types.CreateCustomMonsterDocument,
    "\n  query GetNewMonster($from: ID!, $copying: Boolean!) {\n    monsters {\n      byKey(key: $from) @include(if: $copying) {\n        ...MonsterFragment\n      }\n      tags\n    }\n  }\n": types.GetNewMonsterDocument,
    "\n  query GetMyCharacters {\n    characters {\n      mine {\n        id\n        name\n      }\n    }\n  }\n": types.GetMyCharactersDocument,
    "\n  mutation Login($input: LoginInput!) {\n    auth {\n      login(input: $input) {\n        id\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    auth {\n      register(input: $input) {\n        id\n      }\n    }\n  }\n": types.RegisterDocument,
    "\n  mutation PostDamage($id: ID!, $input: DamageRollInput!) {\n    campaigns {\n      postDamage(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n": types.PostDamageDocument,
    "\n  mutation PostMonsterDamage($input: DamageRollInput!, $monsterId: ID!) {\n    campaigns {\n      postMonsterDamage(input: $input, monsterId: $monsterId) {\n        id\n      }\n    }\n  }\n": types.PostMonsterDamageDocument,
    "\n  mutation Logout {\n    auth {\n      logout\n    }\n  }\n": types.LogoutDocument,
    "\n  mutation PostRoll($id: ID!, $input: RollInput!) {\n    campaigns {\n      postRoll(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n": types.PostRollDocument,
    "\n  mutation RemoveBonus($bonusId: ID!) {\n    characters {\n      removeBonus(bonusId: $bonusId) {\n        bonuses {\n          ...BonusFragment\n        }\n        id\n      }\n    }\n  }\n": types.RemoveBonusDocument,
    "\n  mutation SubmitSessionReport($id: ID!, $input: SessionReportInput!) {\n    characters {\n      submitSessionReport(id: $id, input: $input) {\n        ...CampaignCharacterFragment\n      }\n    }\n  }\n": types.SubmitSessionReportDocument,
    "\n  fragment BonusFragment on Bonus {\n    amount\n    id\n    kind\n    label\n  }\n": types.BonusFragmentFragmentDoc,
    "\n  fragment CampaignCharacterFragment on Character {\n    alignmentDescription\n    alignmentType\n    bonds {\n      id\n      target {\n        id\n        name\n      }\n      text\n    }\n    campaign {\n      characters {\n        id\n        name\n      }\n      id\n      isGm\n      name\n    }\n    characterClass {\n      bonds\n      key\n    }\n    id\n    name\n    pendingSession {\n      id\n      learned {\n        checked\n      }\n      looted {\n        checked\n      }\n      number\n      overcame {\n        checked\n      }\n    }\n    viewerIsOwner\n    xp\n  }\n": types.CampaignCharacterFragmentFragmentDoc,
    "\n  fragment CharacterFragment on Character {\n    abilities {\n      ability\n      modifier\n      score\n    }\n    advancedMoves {\n      ...MoveFragment\n    }\n    alignmentDescription\n    alignmentType\n    armor\n    availableAdvancedMoves {\n      ...MoveFragment\n    }\n    bonuses {\n      ...BonusFragment\n    }\n    campaign {\n      id\n      isGm\n      name\n    }\n    canLevelUp\n    characterClass {\n      damageDie\n      hpBase\n      key\n      name\n    }\n    classMoves {\n      ...MoveFragment\n    }\n    debilities\n    equipment {\n      ...ItemFragment\n    }\n    gold\n    hitPoints\n    id\n    expectedSpellbookSize\n    isDying\n    level\n    load\n    looks {\n      id\n      lookType {\n        key\n        name\n      }\n      value\n    }\n    maxHitPoints\n    maxLoad\n    maxPreparedSpellLevels\n    name\n    preparedSpellLevels\n    preparedSpells {\n      isForgotten\n      spell {\n        ...SpellFragment\n      }\n    }\n    raceMove {\n      ...MoveFragment\n    }\n    spellbook {\n      ...SpellFragment\n    }\n    viewerIsOwner\n    xp\n    xpToLevel\n    ...CampaignCharacterFragment\n  }\n": types.CharacterFragmentFragmentDoc,
    "\n  fragment DangerFragment on Danger {\n    category {\n      key\n      moves\n      name\n    }\n    frontId\n    id\n    impendingDoom\n    impulse\n    name\n    notes\n    portents {\n      done\n      id\n      revealed\n      text\n    }\n    revealed\n    type\n  }\n": types.DangerFragmentFragmentDoc,
    "\n  fragment ItemFragment on Item {\n    count\n    description\n    id\n    isWorn\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n    type\n  }\n": types.ItemFragmentFragmentDoc,
    "\n  fragment ItemOptionFragment on ItemOption {\n    count\n    description\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n  }\n": types.ItemOptionFragmentFragmentDoc,
    "\n  fragment MessageFragment on Message {\n    authorIsGm\n    authorName\n    body\n    characterId\n    characterName\n    createdAt\n    gmOnly\n    id\n    kind\n    ooc\n    roll {\n      band\n      dice {\n        dropped\n        sides\n        value\n      }\n      diceTotal\n      label\n      modifiers {\n        label\n        value\n      }\n      move {\n        key\n        name\n        on10\n        on7to9\n        onMiss\n      }\n      source\n      total\n    }\n    viewerIsAuthor\n    whisperTo\n  }\n": types.MessageFragmentFragmentDoc,
    "\n  fragment MonsterFragment on Monster {\n    armor\n    attack {\n      damage\n      ignoresArmor\n      name\n      piercing\n      tags\n    }\n    description\n    hp\n    id\n    instinct\n    moves\n    name\n    setting {\n      key\n      name\n    }\n    source\n    sourceKey\n    specialQualities\n    tags\n  }\n": types.MonsterFragmentFragmentDoc,
    "\n  fragment MoveFragment on Move {\n    creationOptions {\n      choices {\n        isPicked\n        key\n        label\n      }\n      label\n      pick\n    }\n    description\n    key\n    name\n    on10\n    on7to9\n    onMiss\n    options\n    replacesKey\n    requiresKey\n    roll\n    trigger\n    type\n  }\n": types.MoveFragmentFragmentDoc,
    "\n  fragment SpellFragment on Spell {\n    description\n    key\n    level\n    name\n    options\n    tags\n  }\n": types.SpellFragmentFragmentDoc,
    "\n  query Me {\n    me {\n      displayName\n      email\n      id\n    }\n  }\n": types.MeDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateCampaign($input: CampaignInput!) {\n    campaigns {\n      create(input: $input) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateCampaign($input: CampaignInput!) {\n    campaigns {\n      create(input: $input) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateCampaign($id: ID!, $input: CampaignInput!) {\n    campaigns {\n      update(id: $id, input: $input) {\n        description\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateCampaign($id: ID!, $input: CampaignInput!) {\n    campaigns {\n      update(id: $id, input: $input) {\n        description\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteCampaign($id: ID!) {\n    campaigns {\n      delete(id: $id)\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteCampaign($id: ID!) {\n    campaigns {\n      delete(id: $id)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkXpForMiss($id: ID!) {\n    characters {\n      adjustXp(delta: 1, id: $id) {\n        id\n        xp\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation MarkXpForMiss($id: ID!) {\n    characters {\n      adjustXp(delta: 1, id: $id) {\n        id\n        xp\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCampaignMessages($before: ID, $id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        id\n        messages(before: $before) {\n          hasMore\n          messages {\n            id\n            ...MessageFragment\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCampaignMessages($before: ID, $id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        id\n        messages(before: $before) {\n          hasMore\n          messages {\n            id\n            ...MessageFragment\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription CampaignMessages($campaignId: ID!) {\n    campaignMessages(campaignId: $campaignId) {\n      id\n      ...MessageFragment\n    }\n  }\n"): (typeof documents)["\n  subscription CampaignMessages($campaignId: ID!) {\n    campaignMessages(campaignId: $campaignId) {\n      id\n      ...MessageFragment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PostMessage($id: ID!, $input: MessageInput!) {\n    campaigns {\n      postMessage(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation PostMessage($id: ID!, $input: MessageInput!) {\n    campaigns {\n      postMessage(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetDangerRevealed($dangerId: ID!, $revealed: Boolean!) {\n    campaigns {\n      setDangerRevealed(dangerId: $dangerId, revealed: $revealed) {\n        ...DangerFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SetDangerRevealed($dangerId: ID!, $revealed: Boolean!) {\n    campaigns {\n      setDangerRevealed(dangerId: $dangerId, revealed: $revealed) {\n        ...DangerFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetPortentDone($done: Boolean!, $portentId: ID!) {\n    campaigns {\n      setPortentDone(done: $done, portentId: $portentId) {\n        ...DangerFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SetPortentDone($done: Boolean!, $portentId: ID!) {\n    campaigns {\n      setPortentDone(done: $done, portentId: $portentId) {\n        ...DangerFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetPortentRevealed($portentId: ID!, $revealed: Boolean!) {\n    campaigns {\n      setPortentRevealed(portentId: $portentId, revealed: $revealed) {\n        ...DangerFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SetPortentRevealed($portentId: ID!, $revealed: Boolean!) {\n    campaigns {\n      setPortentRevealed(portentId: $portentId, revealed: $revealed) {\n        ...DangerFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation EndSession($id: ID!, $input: EndSessionInput!) {\n    campaigns {\n      endSession(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation EndSession($id: ID!, $input: EndSessionInput!) {\n    campaigns {\n      endSession(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCampaignDangers($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        dangersWithoutFront {\n          ...DangerFragment\n        }\n        fronts {\n          dangers {\n            ...DangerFragment\n          }\n          id\n          name\n          resolved\n        }\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCampaignDangers($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        dangersWithoutFront {\n          ...DangerFragment\n        }\n        fronts {\n          dangers {\n            ...DangerFragment\n          }\n          id\n          name\n          resolved\n        }\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCampaign($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        characters {\n          alignmentType\n          bondCount\n          characterClass {\n            name\n          }\n          hitPoints\n          id\n          looks {\n            id\n            value\n          }\n          maxHitPoints\n          name\n          owner {\n            displayName\n          }\n          raceMove {\n            name\n          }\n        }\n        description\n        gm {\n          displayName\n        }\n        id\n        inviteCode\n        isGm\n        myCharacter {\n          id\n          ...CampaignCharacterFragment\n          ...CharacterFragment\n        }\n        name\n        sessions {\n          createdAt\n          id\n          learned {\n            checked\n            reason\n          }\n          looted {\n            checked\n            reason\n          }\n          number\n          overcame {\n            checked\n            reason\n          }\n          reports {\n            alignment {\n              checked\n              reason\n            }\n            bond {\n              checked\n              reason\n            }\n            character {\n              id\n              name\n            }\n            resolvedBondText\n            xpAwarded\n          }\n        }\n      }\n    }\n    moves {\n      basicMoves: byType(type: \"basic\") {\n        ...MoveFragment\n      }\n      specialMoves: byType(type: \"special\") {\n        ...MoveFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCampaign($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        characters {\n          alignmentType\n          bondCount\n          characterClass {\n            name\n          }\n          hitPoints\n          id\n          looks {\n            id\n            value\n          }\n          maxHitPoints\n          name\n          owner {\n            displayName\n          }\n          raceMove {\n            name\n          }\n        }\n        description\n        gm {\n          displayName\n        }\n        id\n        inviteCode\n        isGm\n        myCharacter {\n          id\n          ...CampaignCharacterFragment\n          ...CharacterFragment\n        }\n        name\n        sessions {\n          createdAt\n          id\n          learned {\n            checked\n            reason\n          }\n          looted {\n            checked\n            reason\n          }\n          number\n          overcame {\n            checked\n            reason\n          }\n          reports {\n            alignment {\n              checked\n              reason\n            }\n            bond {\n              checked\n              reason\n            }\n            character {\n              id\n              name\n            }\n            resolvedBondText\n            xpAwarded\n          }\n        }\n      }\n    }\n    moves {\n      basicMoves: byType(type: \"basic\") {\n        ...MoveFragment\n      }\n      specialMoves: byType(type: \"special\") {\n        ...MoveFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RegenerateInviteCode($id: ID!) {\n    campaigns {\n      regenerateInviteCode(id: $id) {\n        id\n        inviteCode\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RegenerateInviteCode($id: ID!) {\n    campaigns {\n      regenerateInviteCode(id: $id) {\n        id\n        inviteCode\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetKnownThreats($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        id\n        knownThreats {\n          dangerId\n          name\n          portents\n          type\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetKnownThreats($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        id\n        knownThreats {\n          dangerId\n          name\n          portents\n          type\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription KnownThreatsChanged($campaignId: ID!) {\n    knownThreatsChanged(campaignId: $campaignId)\n  }\n"): (typeof documents)["\n  subscription KnownThreatsChanged($campaignId: ID!) {\n    knownThreatsChanged(campaignId: $campaignId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCampaignMonsters($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        encounters {\n          id\n          monsters {\n            id\n          }\n          name\n        }\n        id\n        monsters {\n          encounterId\n          hp\n          id\n          maxHp\n          name\n          statBlock {\n            ...MonsterFragment\n          }\n        }\n      }\n    }\n    monsters {\n      compendium {\n        hp\n        id\n        name\n        setting {\n          key\n          name\n        }\n        tags\n      }\n      mine {\n        hp\n        id\n        name\n        tags\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCampaignMonsters($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        encounters {\n          id\n          monsters {\n            id\n          }\n          name\n        }\n        id\n        monsters {\n          encounterId\n          hp\n          id\n          maxHp\n          name\n          statBlock {\n            ...MonsterFragment\n          }\n        }\n      }\n    }\n    monsters {\n      compendium {\n        hp\n        id\n        name\n        setting {\n          key\n          name\n        }\n        tags\n      }\n      mine {\n        hp\n        id\n        name\n        tags\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddMonsters($id: ID!, $input: AddMonstersInput!) {\n    campaigns {\n      addMonsters(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddMonsters($id: ID!, $input: AddMonstersInput!) {\n    campaigns {\n      addMonsters(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DamageMonster($input: TakeDamageInput!, $monsterId: ID!) {\n    campaigns {\n      damageMonster(input: $input, monsterId: $monsterId) {\n        hp\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation DamageMonster($input: TakeDamageInput!, $monsterId: ID!) {\n    campaigns {\n      damageMonster(input: $input, monsterId: $monsterId) {\n        hp\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation HealMonster($amount: Int!, $monsterId: ID!) {\n    campaigns {\n      healMonster(amount: $amount, monsterId: $monsterId) {\n        hp\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation HealMonster($amount: Int!, $monsterId: ID!) {\n    campaigns {\n      healMonster(amount: $amount, monsterId: $monsterId) {\n        hp\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RenameMonster($monsterId: ID!, $name: String!) {\n    campaigns {\n      renameMonster(monsterId: $monsterId, name: $name) {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RenameMonster($monsterId: ID!, $name: String!) {\n    campaigns {\n      renameMonster(monsterId: $monsterId, name: $name) {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RunEncounter($encounterId: ID!) {\n    campaigns {\n      runEncounter(encounterId: $encounterId) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RunEncounter($encounterId: ID!) {\n    campaigns {\n      runEncounter(encounterId: $encounterId) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveMonster($monsterId: ID!) {\n    campaigns {\n      removeMonster(monsterId: $monsterId)\n    }\n  }\n"): (typeof documents)["\n  mutation RemoveMonster($monsterId: ID!) {\n    campaigns {\n      removeMonster(monsterId: $monsterId)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation LeaveCampaign($characterId: ID!) {\n    campaigns {\n      leave(characterId: $characterId) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation LeaveCampaign($characterId: ID!) {\n    campaigns {\n      leave(characterId: $characterId) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveCharacter($characterId: ID!, $id: ID!) {\n    campaigns {\n      removeCharacter(characterId: $characterId, id: $id) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RemoveCharacter($characterId: ID!, $id: ID!) {\n    campaigns {\n      removeCharacter(characterId: $characterId, id: $id) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteDanger($dangerId: ID!) {\n    campaigns {\n      deleteDanger(dangerId: $dangerId)\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteDanger($dangerId: ID!) {\n    campaigns {\n      deleteDanger(dangerId: $dangerId)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateDanger($id: ID!, $input: DangerInput!) {\n    campaigns {\n      createDanger(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateDanger($id: ID!, $input: DangerInput!) {\n    campaigns {\n      createDanger(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateDanger($dangerId: ID!, $input: DangerInput!) {\n    campaigns {\n      updateDanger(dangerId: $dangerId, input: $input) {\n        ...DangerFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateDanger($dangerId: ID!, $input: DangerInput!) {\n    campaigns {\n      updateDanger(dangerId: $dangerId, input: $input) {\n        ...DangerFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddEncounterMonsters($encounterId: ID!, $input: AddMonstersInput!) {\n    campaigns {\n      addEncounterMonsters(encounterId: $encounterId, input: $input) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddEncounterMonsters($encounterId: ID!, $input: AddMonstersInput!) {\n    campaigns {\n      addEncounterMonsters(encounterId: $encounterId, input: $input) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetEncounterMonsterCount($count: Int!, $encounterMonsterId: ID!) {\n    campaigns {\n      setEncounterMonsterCount(\n        count: $count\n        encounterMonsterId: $encounterMonsterId\n      ) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SetEncounterMonsterCount($count: Int!, $encounterMonsterId: ID!) {\n    campaigns {\n      setEncounterMonsterCount(\n        count: $count\n        encounterMonsterId: $encounterMonsterId\n      ) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveEncounterMonster($encounterMonsterId: ID!) {\n    campaigns {\n      removeEncounterMonster(encounterMonsterId: $encounterMonsterId) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RemoveEncounterMonster($encounterMonsterId: ID!) {\n    campaigns {\n      removeEncounterMonster(encounterMonsterId: $encounterMonsterId) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteEncounter($encounterId: ID!) {\n    campaigns {\n      deleteEncounter(encounterId: $encounterId)\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteEncounter($encounterId: ID!) {\n    campaigns {\n      deleteEncounter(encounterId: $encounterId)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateEncounter($id: ID!, $input: EncounterInput!) {\n    campaigns {\n      createEncounter(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateEncounter($id: ID!, $input: EncounterInput!) {\n    campaigns {\n      createEncounter(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateEncounter($encounterId: ID!, $input: EncounterInput!) {\n    campaigns {\n      updateEncounter(encounterId: $encounterId, input: $input) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateEncounter($encounterId: ID!, $input: EncounterInput!) {\n    campaigns {\n      updateEncounter(encounterId: $encounterId, input: $input) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetFrontResolved($frontId: ID!, $resolved: Boolean!) {\n    campaigns {\n      setFrontResolved(frontId: $frontId, resolved: $resolved) {\n        id\n        resolved\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SetFrontResolved($frontId: ID!, $resolved: Boolean!) {\n    campaigns {\n      setFrontResolved(frontId: $frontId, resolved: $resolved) {\n        id\n        resolved\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteFront($frontId: ID!) {\n    campaigns {\n      deleteFront(frontId: $frontId)\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteFront($frontId: ID!) {\n    campaigns {\n      deleteFront(frontId: $frontId)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateFront($id: ID!, $input: FrontInput!) {\n    campaigns {\n      createFront(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateFront($id: ID!, $input: FrontInput!) {\n    campaigns {\n      createFront(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateFront($frontId: ID!, $input: FrontInput!) {\n    campaigns {\n      updateFront(frontId: $frontId, input: $input) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateFront($frontId: ID!, $input: FrontInput!) {\n    campaigns {\n      updateFront(frontId: $frontId, input: $input) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPrep($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        dangersWithoutFront {\n          ...DangerFragment\n        }\n        encounters {\n          danger {\n            id\n            name\n          }\n          id\n          location\n          monsters {\n            count\n            id\n            maxHp\n            statBlock {\n              armor\n              name\n            }\n          }\n          name\n          notes\n        }\n        fronts {\n          dangers {\n            ...DangerFragment\n          }\n          id\n          kind\n          name\n          notes\n          resolved\n          stakes {\n            answer\n            question\n          }\n        }\n        id\n        name\n      }\n    }\n    dangerTemplate {\n      categories {\n        key\n        name\n        types {\n          impulse\n          key\n          name\n        }\n      }\n      impendingDooms {\n        description\n        key\n        name\n      }\n    }\n    monsters {\n      compendium {\n        hp\n        id\n        name\n        setting {\n          key\n          name\n        }\n        tags\n      }\n      mine {\n        hp\n        id\n        name\n        tags\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetPrep($id: ID!) {\n    campaigns {\n      byId(id: $id) {\n        dangersWithoutFront {\n          ...DangerFragment\n        }\n        encounters {\n          danger {\n            id\n            name\n          }\n          id\n          location\n          monsters {\n            count\n            id\n            maxHp\n            statBlock {\n              armor\n              name\n            }\n          }\n          name\n          notes\n        }\n        fronts {\n          dangers {\n            ...DangerFragment\n          }\n          id\n          kind\n          name\n          notes\n          resolved\n          stakes {\n            answer\n            question\n          }\n        }\n        id\n        name\n      }\n    }\n    dangerTemplate {\n      categories {\n        key\n        name\n        types {\n          impulse\n          key\n          name\n        }\n      }\n      impendingDooms {\n        description\n        key\n        name\n      }\n    }\n    monsters {\n      compendium {\n        hp\n        id\n        name\n        setting {\n          key\n          name\n        }\n        tags\n      }\n      mine {\n        hp\n        id\n        name\n        tags\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMyCampaigns {\n    campaigns {\n      mine {\n        id\n        isGm\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetMyCampaigns {\n    campaigns {\n      mine {\n        id\n        isGm\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetDebility($active: Boolean!, $debility: Debility!, $id: ID!) {\n    characters {\n      setDebility(active: $active, debility: $debility, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SetDebility($active: Boolean!, $debility: Debility!, $id: ID!) {\n    characters {\n      setDebility(active: $active, debility: $debility, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddItem($characterId: ID!, $input: AddItemInput!) {\n    items {\n      add(characterId: $characterId, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddItem($characterId: ID!, $input: AddItemInput!) {\n    items {\n      add(characterId: $characterId, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ItemTemplates {\n    itemTemplates {\n      all {\n        key\n        label\n        type\n      }\n    }\n  }\n"): (typeof documents)["\n  query ItemTemplates {\n    itemTemplates {\n      all {\n        key\n        label\n        type\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddBond($id: ID!, $input: BondInput!) {\n    characters {\n      addBond(id: $id, input: $input) {\n        ...CampaignCharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddBond($id: ID!, $input: BondInput!) {\n    characters {\n      addBond(id: $id, input: $input) {\n        ...CampaignCharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteBond($bondId: ID!) {\n    characters {\n      deleteBond(bondId: $bondId) {\n        ...CampaignCharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteBond($bondId: ID!) {\n    characters {\n      deleteBond(bondId: $bondId) {\n        ...CampaignCharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateBond($bondId: ID!, $text: String!) {\n    characters {\n      updateBond(bondId: $bondId, text: $text) {\n        ...CampaignCharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateBond($bondId: ID!, $text: String!) {\n    characters {\n      updateBond(bondId: $bondId, text: $text) {\n        ...CampaignCharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddBonus($id: ID!, $input: BonusInput!) {\n    characters {\n      addBonus(id: $id, input: $input) {\n        bonuses {\n          ...BonusFragment\n        }\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddBonus($id: ID!, $input: BonusInput!) {\n    characters {\n      addBonus(id: $id, input: $input) {\n        bonuses {\n          ...BonusFragment\n        }\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveBonusFromSheet($bonusId: ID!) {\n    characters {\n      removeBonus(bonusId: $bonusId) {\n        bonuses {\n          ...BonusFragment\n        }\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RemoveBonusFromSheet($bonusId: ID!) {\n    characters {\n      removeBonus(bonusId: $bonusId) {\n        bonuses {\n          ...BonusFragment\n        }\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AdjustGold($delta: Int!, $id: ID!) {\n    characters {\n      adjustGold(delta: $delta, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AdjustGold($delta: Int!, $id: ID!) {\n    characters {\n      adjustGold(delta: $delta, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveItem($id: ID!) {\n    items {\n      remove(id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RemoveItem($id: ID!) {\n    items {\n      remove(id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetItemCount($count: Int!, $id: ID!) {\n    items {\n      setCount(count: $count, id: $id) {\n        ...ItemFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SetItemCount($count: Int!, $id: ID!) {\n    items {\n      setCount(count: $count, id: $id) {\n        ...ItemFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ToggleItemWorn($id: ID!, $worn: Boolean!) {\n    items {\n      setWorn(id: $id, worn: $worn) {\n        ...ItemFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ToggleItemWorn($id: ID!, $worn: Boolean!) {\n    items {\n      setWorn(id: $id, worn: $worn) {\n        ...ItemFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AdjustXp($delta: Int!, $id: ID!) {\n    characters {\n      adjustXp(delta: $delta, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AdjustXp($delta: Int!, $id: ID!) {\n    characters {\n      adjustXp(delta: $delta, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCharacter($id: ID!) {\n    characters {\n      byId(id: $id) {\n        ...CharacterFragment\n      }\n    }\n    moves {\n      basicMoves: byType(type: \"basic\") {\n        ...MoveFragment\n      }\n      specialMoves: byType(type: \"special\") {\n        ...MoveFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCharacter($id: ID!) {\n    characters {\n      byId(id: $id) {\n        ...CharacterFragment\n      }\n    }\n    moves {\n      basicMoves: byType(type: \"basic\") {\n        ...MoveFragment\n      }\n      specialMoves: byType(type: \"special\") {\n        ...MoveFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Heal($amount: Int!, $id: ID!) {\n    characters {\n      heal(amount: $amount, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Heal($amount: Int!, $id: ID!) {\n    characters {\n      heal(amount: $amount, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation TakeDamage($id: ID!, $input: TakeDamageInput!) {\n    characters {\n      takeDamage(id: $id, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation TakeDamage($id: ID!, $input: TakeDamageInput!) {\n    characters {\n      takeDamage(id: $id, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation LevelUp($id: ID!, $input: LevelUpInput!) {\n    characters {\n      levelUp(id: $id, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation LevelUp($id: ID!, $input: LevelUpInput!) {\n    characters {\n      levelUp(id: $id, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PrepareSpells($characterId: ID!, $spellKeys: [ID!]!) {\n    spells {\n      prepare(characterId: $characterId, spellKeys: $spellKeys) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation PrepareSpells($characterId: ID!, $spellKeys: [ID!]!) {\n    spells {\n      prepare(characterId: $characterId, spellKeys: $spellKeys) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddToSpellbook($characterId: ID!, $spellKey: ID!) {\n    spells {\n      addToSpellbook(characterId: $characterId, spellKey: $spellKey) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddToSpellbook($characterId: ID!, $spellKey: ID!) {\n    spells {\n      addToSpellbook(characterId: $characterId, spellKey: $spellKey) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveFromSpellbook($characterId: ID!, $spellKey: ID!) {\n    spells {\n      removeFromSpellbook(characterId: $characterId, spellKey: $spellKey) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RemoveFromSpellbook($characterId: ID!, $spellKey: ID!) {\n    spells {\n      removeFromSpellbook(characterId: $characterId, spellKey: $spellKey) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetSpellForgotten(\n    $characterId: ID!\n    $forgotten: Boolean!\n    $spellKey: ID!\n  ) {\n    spells {\n      setForgotten(\n        characterId: $characterId\n        forgotten: $forgotten\n        spellKey: $spellKey\n      ) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SetSpellForgotten(\n    $characterId: ID!\n    $forgotten: Boolean!\n    $spellKey: ID!\n  ) {\n    spells {\n      setForgotten(\n        characterId: $characterId\n        forgotten: $forgotten\n        spellKey: $spellKey\n      ) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SpellsByClass($classKey: ID!) {\n    spells {\n      byClass(classKey: $classKey) {\n        ...SpellFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  query SpellsByClass($classKey: ID!) {\n    spells {\n      byClass(classKey: $classKey) {\n        ...SpellFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCharacterClassesForCreate {\n    characterClasses {\n      all {\n        alignmentTemplates {\n          alignment\n          description\n        }\n        bonds\n        damageDie\n        hpBase\n        key\n        lookExamples {\n          examples\n          type\n        }\n        name\n        raceMoves {\n          key\n          ...MoveFragment\n        }\n        startingGear {\n          default {\n            ...ItemOptionFragment\n          }\n          loadBase\n          options {\n            pick\n            choices {\n              ...ItemOptionFragment\n            }\n          }\n        }\n        startingMoves {\n          key\n          ...MoveFragment\n        }\n      }\n    }\n    lookTypes {\n      all {\n        examples\n        key\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCharacterClassesForCreate {\n    characterClasses {\n      all {\n        alignmentTemplates {\n          alignment\n          description\n        }\n        bonds\n        damageDie\n        hpBase\n        key\n        lookExamples {\n          examples\n          type\n        }\n        name\n        raceMoves {\n          key\n          ...MoveFragment\n        }\n        startingGear {\n          default {\n            ...ItemOptionFragment\n          }\n          loadBase\n          options {\n            pick\n            choices {\n              ...ItemOptionFragment\n            }\n          }\n        }\n        startingMoves {\n          key\n          ...MoveFragment\n        }\n      }\n    }\n    lookTypes {\n      all {\n        examples\n        key\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateCharacter($input: CreateCharacterInput!) {\n    characters {\n      create(input: $input) {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateCharacter($input: CreateCharacterInput!) {\n    characters {\n      create(input: $input) {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation JoinCampaign($characterId: ID!, $code: String!) {\n    campaigns {\n      join(characterId: $characterId, code: $code) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation JoinCampaign($characterId: ID!, $code: String!) {\n    campaigns {\n      join(characterId: $characterId, code: $code) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetInvite($code: String!) {\n    campaigns {\n      byInviteCode(code: $code) {\n        gm {\n          displayName\n        }\n        name\n      }\n    }\n    characters {\n      mine {\n        campaign {\n          id\n        }\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetInvite($code: String!) {\n    campaigns {\n      byInviteCode(code: $code) {\n        gm {\n          displayName\n        }\n        name\n      }\n    }\n    characters {\n      mine {\n        campaign {\n          id\n        }\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMonsters {\n    monsters {\n      compendium {\n        armor\n        hp\n        id\n        name\n        setting {\n          key\n          name\n        }\n        tags\n      }\n      mine {\n        armor\n        hp\n        id\n        name\n        tags\n      }\n      settings {\n        key\n        name\n      }\n      tags\n    }\n  }\n"): (typeof documents)["\n  query GetMonsters {\n    monsters {\n      compendium {\n        armor\n        hp\n        id\n        name\n        setting {\n          key\n          name\n        }\n        tags\n      }\n      mine {\n        armor\n        hp\n        id\n        name\n        tags\n      }\n      settings {\n        key\n        name\n      }\n      tags\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCompendiumMonster($key: ID!) {\n    monsters {\n      byKey(key: $key) {\n        ...MonsterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCompendiumMonster($key: ID!) {\n    monsters {\n      byKey(key: $key) {\n        ...MonsterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateCustomMonster($id: ID!, $input: MonsterInput!) {\n    monsters {\n      updateCustom(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateCustomMonster($id: ID!, $input: MonsterInput!) {\n    monsters {\n      updateCustom(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteCustomMonster($id: ID!) {\n    monsters {\n      deleteCustom(id: $id)\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteCustomMonster($id: ID!) {\n    monsters {\n      deleteCustom(id: $id)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCustomMonster($id: ID!) {\n    monsters {\n      custom(id: $id) {\n        ...MonsterFragment\n      }\n      tags\n    }\n  }\n"): (typeof documents)["\n  query GetCustomMonster($id: ID!) {\n    monsters {\n      custom(id: $id) {\n        ...MonsterFragment\n      }\n      tags\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateCustomMonster($input: MonsterInput!) {\n    monsters {\n      createCustom(input: $input) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateCustomMonster($input: MonsterInput!) {\n    monsters {\n      createCustom(input: $input) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetNewMonster($from: ID!, $copying: Boolean!) {\n    monsters {\n      byKey(key: $from) @include(if: $copying) {\n        ...MonsterFragment\n      }\n      tags\n    }\n  }\n"): (typeof documents)["\n  query GetNewMonster($from: ID!, $copying: Boolean!) {\n    monsters {\n      byKey(key: $from) @include(if: $copying) {\n        ...MonsterFragment\n      }\n      tags\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMyCharacters {\n    characters {\n      mine {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetMyCharacters {\n    characters {\n      mine {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($input: LoginInput!) {\n    auth {\n      login(input: $input) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    auth {\n      login(input: $input) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Register($input: RegisterInput!) {\n    auth {\n      register(input: $input) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Register($input: RegisterInput!) {\n    auth {\n      register(input: $input) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PostDamage($id: ID!, $input: DamageRollInput!) {\n    campaigns {\n      postDamage(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation PostDamage($id: ID!, $input: DamageRollInput!) {\n    campaigns {\n      postDamage(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PostMonsterDamage($input: DamageRollInput!, $monsterId: ID!) {\n    campaigns {\n      postMonsterDamage(input: $input, monsterId: $monsterId) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation PostMonsterDamage($input: DamageRollInput!, $monsterId: ID!) {\n    campaigns {\n      postMonsterDamage(input: $input, monsterId: $monsterId) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Logout {\n    auth {\n      logout\n    }\n  }\n"): (typeof documents)["\n  mutation Logout {\n    auth {\n      logout\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PostRoll($id: ID!, $input: RollInput!) {\n    campaigns {\n      postRoll(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation PostRoll($id: ID!, $input: RollInput!) {\n    campaigns {\n      postRoll(id: $id, input: $input) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveBonus($bonusId: ID!) {\n    characters {\n      removeBonus(bonusId: $bonusId) {\n        bonuses {\n          ...BonusFragment\n        }\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RemoveBonus($bonusId: ID!) {\n    characters {\n      removeBonus(bonusId: $bonusId) {\n        bonuses {\n          ...BonusFragment\n        }\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SubmitSessionReport($id: ID!, $input: SessionReportInput!) {\n    characters {\n      submitSessionReport(id: $id, input: $input) {\n        ...CampaignCharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SubmitSessionReport($id: ID!, $input: SessionReportInput!) {\n    characters {\n      submitSessionReport(id: $id, input: $input) {\n        ...CampaignCharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment BonusFragment on Bonus {\n    amount\n    id\n    kind\n    label\n  }\n"): (typeof documents)["\n  fragment BonusFragment on Bonus {\n    amount\n    id\n    kind\n    label\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment CampaignCharacterFragment on Character {\n    alignmentDescription\n    alignmentType\n    bonds {\n      id\n      target {\n        id\n        name\n      }\n      text\n    }\n    campaign {\n      characters {\n        id\n        name\n      }\n      id\n      isGm\n      name\n    }\n    characterClass {\n      bonds\n      key\n    }\n    id\n    name\n    pendingSession {\n      id\n      learned {\n        checked\n      }\n      looted {\n        checked\n      }\n      number\n      overcame {\n        checked\n      }\n    }\n    viewerIsOwner\n    xp\n  }\n"): (typeof documents)["\n  fragment CampaignCharacterFragment on Character {\n    alignmentDescription\n    alignmentType\n    bonds {\n      id\n      target {\n        id\n        name\n      }\n      text\n    }\n    campaign {\n      characters {\n        id\n        name\n      }\n      id\n      isGm\n      name\n    }\n    characterClass {\n      bonds\n      key\n    }\n    id\n    name\n    pendingSession {\n      id\n      learned {\n        checked\n      }\n      looted {\n        checked\n      }\n      number\n      overcame {\n        checked\n      }\n    }\n    viewerIsOwner\n    xp\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment CharacterFragment on Character {\n    abilities {\n      ability\n      modifier\n      score\n    }\n    advancedMoves {\n      ...MoveFragment\n    }\n    alignmentDescription\n    alignmentType\n    armor\n    availableAdvancedMoves {\n      ...MoveFragment\n    }\n    bonuses {\n      ...BonusFragment\n    }\n    campaign {\n      id\n      isGm\n      name\n    }\n    canLevelUp\n    characterClass {\n      damageDie\n      hpBase\n      key\n      name\n    }\n    classMoves {\n      ...MoveFragment\n    }\n    debilities\n    equipment {\n      ...ItemFragment\n    }\n    gold\n    hitPoints\n    id\n    expectedSpellbookSize\n    isDying\n    level\n    load\n    looks {\n      id\n      lookType {\n        key\n        name\n      }\n      value\n    }\n    maxHitPoints\n    maxLoad\n    maxPreparedSpellLevels\n    name\n    preparedSpellLevels\n    preparedSpells {\n      isForgotten\n      spell {\n        ...SpellFragment\n      }\n    }\n    raceMove {\n      ...MoveFragment\n    }\n    spellbook {\n      ...SpellFragment\n    }\n    viewerIsOwner\n    xp\n    xpToLevel\n    ...CampaignCharacterFragment\n  }\n"): (typeof documents)["\n  fragment CharacterFragment on Character {\n    abilities {\n      ability\n      modifier\n      score\n    }\n    advancedMoves {\n      ...MoveFragment\n    }\n    alignmentDescription\n    alignmentType\n    armor\n    availableAdvancedMoves {\n      ...MoveFragment\n    }\n    bonuses {\n      ...BonusFragment\n    }\n    campaign {\n      id\n      isGm\n      name\n    }\n    canLevelUp\n    characterClass {\n      damageDie\n      hpBase\n      key\n      name\n    }\n    classMoves {\n      ...MoveFragment\n    }\n    debilities\n    equipment {\n      ...ItemFragment\n    }\n    gold\n    hitPoints\n    id\n    expectedSpellbookSize\n    isDying\n    level\n    load\n    looks {\n      id\n      lookType {\n        key\n        name\n      }\n      value\n    }\n    maxHitPoints\n    maxLoad\n    maxPreparedSpellLevels\n    name\n    preparedSpellLevels\n    preparedSpells {\n      isForgotten\n      spell {\n        ...SpellFragment\n      }\n    }\n    raceMove {\n      ...MoveFragment\n    }\n    spellbook {\n      ...SpellFragment\n    }\n    viewerIsOwner\n    xp\n    xpToLevel\n    ...CampaignCharacterFragment\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment DangerFragment on Danger {\n    category {\n      key\n      moves\n      name\n    }\n    frontId\n    id\n    impendingDoom\n    impulse\n    name\n    notes\n    portents {\n      done\n      id\n      revealed\n      text\n    }\n    revealed\n    type\n  }\n"): (typeof documents)["\n  fragment DangerFragment on Danger {\n    category {\n      key\n      moves\n      name\n    }\n    frontId\n    id\n    impendingDoom\n    impulse\n    name\n    notes\n    portents {\n      done\n      id\n      revealed\n      text\n    }\n    revealed\n    type\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ItemFragment on Item {\n    count\n    description\n    id\n    isWorn\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n    type\n  }\n"): (typeof documents)["\n  fragment ItemFragment on Item {\n    count\n    description\n    id\n    isWorn\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n    type\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ItemOptionFragment on ItemOption {\n    count\n    description\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n  }\n"): (typeof documents)["\n  fragment ItemOptionFragment on ItemOption {\n    count\n    description\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment MessageFragment on Message {\n    authorIsGm\n    authorName\n    body\n    characterId\n    characterName\n    createdAt\n    gmOnly\n    id\n    kind\n    ooc\n    roll {\n      band\n      dice {\n        dropped\n        sides\n        value\n      }\n      diceTotal\n      label\n      modifiers {\n        label\n        value\n      }\n      move {\n        key\n        name\n        on10\n        on7to9\n        onMiss\n      }\n      source\n      total\n    }\n    viewerIsAuthor\n    whisperTo\n  }\n"): (typeof documents)["\n  fragment MessageFragment on Message {\n    authorIsGm\n    authorName\n    body\n    characterId\n    characterName\n    createdAt\n    gmOnly\n    id\n    kind\n    ooc\n    roll {\n      band\n      dice {\n        dropped\n        sides\n        value\n      }\n      diceTotal\n      label\n      modifiers {\n        label\n        value\n      }\n      move {\n        key\n        name\n        on10\n        on7to9\n        onMiss\n      }\n      source\n      total\n    }\n    viewerIsAuthor\n    whisperTo\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment MonsterFragment on Monster {\n    armor\n    attack {\n      damage\n      ignoresArmor\n      name\n      piercing\n      tags\n    }\n    description\n    hp\n    id\n    instinct\n    moves\n    name\n    setting {\n      key\n      name\n    }\n    source\n    sourceKey\n    specialQualities\n    tags\n  }\n"): (typeof documents)["\n  fragment MonsterFragment on Monster {\n    armor\n    attack {\n      damage\n      ignoresArmor\n      name\n      piercing\n      tags\n    }\n    description\n    hp\n    id\n    instinct\n    moves\n    name\n    setting {\n      key\n      name\n    }\n    source\n    sourceKey\n    specialQualities\n    tags\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment MoveFragment on Move {\n    creationOptions {\n      choices {\n        isPicked\n        key\n        label\n      }\n      label\n      pick\n    }\n    description\n    key\n    name\n    on10\n    on7to9\n    onMiss\n    options\n    replacesKey\n    requiresKey\n    roll\n    trigger\n    type\n  }\n"): (typeof documents)["\n  fragment MoveFragment on Move {\n    creationOptions {\n      choices {\n        isPicked\n        key\n        label\n      }\n      label\n      pick\n    }\n    description\n    key\n    name\n    on10\n    on7to9\n    onMiss\n    options\n    replacesKey\n    requiresKey\n    roll\n    trigger\n    type\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment SpellFragment on Spell {\n    description\n    key\n    level\n    name\n    options\n    tags\n  }\n"): (typeof documents)["\n  fragment SpellFragment on Spell {\n    description\n    key\n    level\n    name\n    options\n    tags\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      displayName\n      email\n      id\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      displayName\n      email\n      id\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;