# flake8: noqa
import pandas as pd
import requests
textile_df = pd.read_csv('data/Fabric Sustainability Data - Textile Research.csv')
textile_df.head()
# item is in this format: materials = {'silk': 53, 'linen': 33, 'cotton': 14}

def get_material_score(materials) -> float:
    # keep only materials and percentages
    materials_and_percents = {key.upper().replace(' ', '_').replace('™', ''): value for key, value in materials.items()}

    # weights
    material_weight = 1/3
    end_of_life_weight = 1/3
    agr_impact_weight = 1/3

    # variables for percentage sums
    material_percent_sum = 0
    eol_percent_sum = 0
    agr_impact_sum = 0

    # go through each material and its percentage
    for material, percent in materials_and_percents.items():
        
        # convert percentage to decimal
        normalized_percent = percent / 100
        # print(material, normalized_percent)

        if material == 'ELASTANE':
            material = 'SPANDEX'

        # get whether the material is "preferred"
        preferred_value = textile_df.loc[textile_df['material_id'] == material, 'preferred'].values[0]
        # print(f'preferred: {preferred_value}')

        # if it is, add the material percentage to sum
        if preferred_value:
            material_percent_sum += normalized_percent

        # get whether the material is "biodegradable"
        biodegradable_value = textile_df.loc[textile_df['material_id'] == material, 'biodegradable'].values[0]
        # print(f'biodegradable: {biodegradable_value}')

        # if it is, add the material percentage to sum
        if biodegradable_value:
            eol_percent_sum += normalized_percent

        # get whether there are good agricultural practices
        agr_impact_value = textile_df.loc[textile_df['material_id'] == material, 'agricultural_impact'].values[0]
        # print(f'agricultural impact: {agr_impact_value}')

        # if it is, add the material percentage to sum
        if not agr_impact_value:
            agr_impact_sum += normalized_percent

        # print()

    # get material score after multiplying by weight
    material_score = material_weight * material_percent_sum

    # get end of life score after multiplying by weight
    end_of_life_score = end_of_life_weight * eol_percent_sum

    # get agricultural impact score after multiplying by weight
    agricultural_impact_score = agr_impact_weight * agr_impact_sum

    # get final score out of 5
    final_score = round(5 * (material_score + end_of_life_score + agricultural_impact_score), 2)
    # print(f'final score out of 5: {final_score}')

    return final_score

# example
# materials = {'silk': 53, 'linen': 33, 'cotton': 14}

# # get score out of 5
# print(get_material_score(materials))