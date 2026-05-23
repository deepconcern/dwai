-- name: InsertCharacter :one
INSERT INTO characters (
        alignment_description,
        alignment_type,
        character_class_key,
        charisma,
        constitution,
        dexterity,
        hit_points,
        intelligence,
        name,
        race_move_key,
        strength,
        wisdom
    )
VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12
    )
RETURNING id;