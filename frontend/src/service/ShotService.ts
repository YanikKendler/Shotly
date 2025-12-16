import {ShotAttributeValueCollection} from "@/util/Types"
import gql from "graphql-tag"
import {apolloClient, makeClient} from "@/components/wrapper/ApolloWrapper"
import {useMemo} from "react"
import {wuGeneral} from "@yanikkendler/web-utils"

export default class ShotService {
    static async updateShot(shotId: string, position: number) {
        const {data, errors} = await apolloClient.mutate({
            mutation : gql`
                mutation updateShot($id: String!, $position: Int!) {
                    updateShot(editDTO:{
                        id: $id,
                        position: $position
                    }){
                        id
                        position
                    }
                }
            `,
            variables: {id: shotId, position: position},
        });
        if(errors) {
            console.error(errors)
        }

        return {data, errors}
    }

    static async updateAttribute(attributeId: number, value: ShotAttributeValueCollection) {
        //console.log("updating attribute", attributeId, value)

        const {data, errors} = await apolloClient.mutate({
            mutation: gql`
                mutation updateShotAttribute($id: BigInteger!, $textValue: String, $singleSelectValue: BigInteger, $multiSelectValue: [BigInteger]) {
                    updateShotAttribute(editDTO:{
                        id: $id
                        textValue: $textValue
                        singleSelectValue: $singleSelectValue
                        multiSelectValue: $multiSelectValue
                    }){
                        id
                    }
                }
            `,
            variables: {id: attributeId, ...value},
        });
        if (errors) {
            console.error(errors)
        }
    }

    static debouncedUpdateAttribute = wuGeneral.debounce(ShotService.updateAttribute)
}