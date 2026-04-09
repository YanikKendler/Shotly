package me.kendler.yanik.endpoints;

import io.quarkus.panache.common.Sort;
import jakarta.inject.Inject;
import me.kendler.yanik.dto.template.TemplateCreateDTO;
import me.kendler.yanik.dto.template.TemplateDTO;
import me.kendler.yanik.dto.template.TemplateEditDTO;
import me.kendler.yanik.dto.template.sceneAttributes.SceneAttributeTemplateBaseDTO;
import me.kendler.yanik.dto.template.sceneAttributes.SceneAttributeTemplateCreateDTO;
import me.kendler.yanik.dto.template.sceneAttributes.SceneAttributeTemplateEditDTO;
import me.kendler.yanik.dto.template.shotAttributes.*;
import me.kendler.yanik.model.Shotlist;
import me.kendler.yanik.model.template.Template;
import me.kendler.yanik.model.template.sceneAttributes.SceneSelectAttributeOptionTemplate;
import me.kendler.yanik.model.template.shotAttributes.ShotSelectAttributeOptionTemplate;
import me.kendler.yanik.rateLimiting.RateLimited;
import me.kendler.yanik.repositories.UserRepository;
import me.kendler.yanik.repositories.template.*;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.UUID;

@GraphQLApi
@RateLimited()
public class TemplateResource {
    @Inject
    JsonWebToken jwt;

    @Inject
    TemplateRepository templateRepository;

    @Inject
    UserRepository userRepository;

    @Query
    public List<TemplateDTO> getTemplates() {
        return templateRepository.findAllForUser(jwt);
    }

    @Query
    public List<TemplateDTO> getAllTemplates() {
        userRepository.checkAdmin(jwt);

        return templateRepository.findAll(Sort.descending("name")).list().stream().map(Template::toDTO).toList();
    }

    @Query
    public TemplateDTO getTemplate(UUID id) {
        userRepository.checkTemplateEditRights(templateRepository.findById(id), jwt);

        return templateRepository.findAsDTO(id);
    }

    @Mutation
    public TemplateDTO createTemplate(TemplateCreateDTO createDTO) {
        return templateRepository.create(createDTO, jwt);
    }

    @Mutation
    public TemplateDTO updateTemplate(TemplateEditDTO editDTO) {
        userRepository.checkTemplateEditRights(templateRepository.findById(editDTO.id()), jwt);
        return templateRepository.update(editDTO);
    }

    @Mutation
    public TemplateDTO deleteTemplate(UUID id) {
        userRepository.checkTemplateEditRights(templateRepository.findById(id), jwt);
        return templateRepository.delete(id);
    }

    /*
     * SHOT ATTRIBUTE DEFINITIONS
     */

    @Inject
    ShotAttributeTemplateRepository shotAttributeTemplateRepository;

    @Mutation
    public ShotAttributeTemplateBaseDTO createShotAttributeTemplate(ShotAttributeTemplateCreateDTO createDTO) {
        userRepository.checkTemplateEditRights(templateRepository.findById(createDTO.templateId()), jwt);
        return shotAttributeTemplateRepository.create(createDTO);
    }

    @Mutation
    public ShotAttributeTemplateBaseDTO updateShotAttributeTemplate(ShotAttributeTemplateEditDTO editDTO) {
        userRepository.checkTemplateEditRights(shotAttributeTemplateRepository.findById(editDTO.id()).template, jwt);
        return shotAttributeTemplateRepository.update(editDTO);
    }

    @Mutation
    public ShotAttributeTemplateBaseDTO deleteShotAttributeTemplate(Long id) {
        userRepository.checkTemplateEditRights(shotAttributeTemplateRepository.findById(id).template, jwt);
        return shotAttributeTemplateRepository.delete(id);
    }

    /*
     * SCENE ATTRIBUTE DEFINITIONS
     */

    @Inject
    SceneAttributeTemplateRepository sceneAttributeTemplateRepository;

    @Mutation
    public SceneAttributeTemplateBaseDTO createSceneAttributeTemplate(SceneAttributeTemplateCreateDTO createDTO) {
        userRepository.checkTemplateEditRights(templateRepository.findById(createDTO.templateId()), jwt);
        return sceneAttributeTemplateRepository.create(createDTO);
    }

    @Mutation
    public SceneAttributeTemplateBaseDTO updateSceneAttributeTemplate(SceneAttributeTemplateEditDTO editDTO) {
        userRepository.checkTemplateEditRights(sceneAttributeTemplateRepository.findById(editDTO.id()).template, jwt);
        return sceneAttributeTemplateRepository.update(editDTO);
    }

    @Mutation
    public SceneAttributeTemplateBaseDTO deleteSceneAttributeTemplate(Long id) {
        userRepository.checkTemplateEditRights(sceneAttributeTemplateRepository.findById(id).template, jwt);
        return sceneAttributeTemplateRepository.delete(id);
    }

    /*
     * SHOT ATTRIBUTE OPTIONS
    */

    @Inject
    ShotSelectAttributeOptionTemplateRepository shotSelectAttributeOptionTemplateRepository;

    @Mutation
    public ShotSelectAttributeOptionTemplate createShotSelectAttributeOptionTemplate(Long attributeTemplateId){
        userRepository.checkTemplateEditRights(shotAttributeTemplateRepository.findById(attributeTemplateId).template, jwt);

        return shotSelectAttributeOptionTemplateRepository.create(attributeTemplateId);
    }

    @Mutation
    public ShotSelectAttributeOptionTemplate deleteShotSelectAttributeOptionTemplate(Long id){
        userRepository.checkTemplateEditRights(shotSelectAttributeOptionTemplateRepository.findById(id).shotAttributeTemplate.template, jwt);

        return shotSelectAttributeOptionTemplateRepository.delete(id);
    }

    @Mutation
    public ShotSelectAttributeOptionTemplate updateShotSelectAttributeOptionTemplate(ShotSelectAttributeOptionTemplateEditDTO editDTO) {
        userRepository.checkTemplateEditRights(shotSelectAttributeOptionTemplateRepository.findById(editDTO.id()).shotAttributeTemplate.template, jwt);

        return shotSelectAttributeOptionTemplateRepository.update(editDTO);
    }

    /*
     * SCENE ATTRIBUTE OPTIONS
     */

    @Inject
    SceneSelectAttributeOptionTemplateRepository sceneSelectAttributeOptionTemplateRepository;

    @Mutation
    public SceneSelectAttributeOptionTemplate createSceneSelectAttributeOptionTemplate(Long attributeTemplateId){
        userRepository.checkTemplateEditRights(sceneAttributeTemplateRepository.findById(attributeTemplateId).template, jwt);

        return sceneSelectAttributeOptionTemplateRepository.create(attributeTemplateId);
    }

    @Mutation
    public SceneSelectAttributeOptionTemplate deleteSceneSelectAttributeOptionTemplate(Long id){
        userRepository.checkTemplateEditRights(sceneSelectAttributeOptionTemplateRepository.findById(id).sceneAttributeTemplate.template, jwt);

        return sceneSelectAttributeOptionTemplateRepository.delete(id);
    }

    @Mutation
    public SceneSelectAttributeOptionTemplate updateSceneSelectAttributeOptionTemplate(SceneSelectAttributeOptionTemplateEditDTO editDTO) {
        userRepository.checkTemplateEditRights(sceneSelectAttributeOptionTemplateRepository.findById(editDTO.id()).sceneAttributeTemplate.template, jwt);

        return sceneSelectAttributeOptionTemplateRepository.update(editDTO);
    }
}
