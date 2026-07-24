package models

import (
	"strconv"

	"github.com/deepconcern/dwai/dwai-api/db"
	"github.com/deepconcern/dwai/dwai-api/graph/model"
)

// ToItemObject builds an owned Item from its database row, its tag override
// rows, and the item template catalog. If row.Key is anything other than
// "custom" it's looked up in templates and merged with row/tags as overrides,
// following the same resolution rules as ItemOptionModel.
func ToItemObject(row *db.Item, tagRows []*db.ItemTag, templates *ItemTemplateMap, td *TagDefinitionMap) *model.Item {
	var itemTemplate *ItemTemplateModel
	if row.Key != "custom" {
		itemTemplate = (*templates)[row.Key]
	}

	var label *string
	if row.Label.Valid {
		label = &row.Label.String
	}

	var description *string
	if row.Description.Valid {
		description = &row.Description.String
	}

	tags := make([]*TagModel, len(tagRows))
	for i, t := range tagRows {
		var quantity *int32
		if t.Quantity.Valid {
			quantity = &t.Quantity.Int32
		}
		tags[i] = &TagModel{Key: t.Key, Quantity: quantity}
	}

	fields := resolveItemFields(label, description, tags, itemTemplate, td)

	var templateObj *model.ItemTemplate
	if itemTemplate != nil {
		templateObj = itemTemplate.ToObject(td)
	}

	return &model.Item{
		Count:       row.Count,
		Description: fields.Description,
		ID:          strconv.Itoa(int(row.ID)),
		IsWorn:      row.IsWorn,
		Key:         row.Key,
		Label:       fields.Label,
		Tags:        fields.Tags,
		Template:    templateObj,
	}
}
